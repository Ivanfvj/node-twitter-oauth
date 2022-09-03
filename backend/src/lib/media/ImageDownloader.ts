import path from "path";
import { RequestOptions } from "http";
import { createWriteStream } from "fs";
import { http, https } from "follow-redirects";
import mime from "mime-types";

type Options = Pick<
  RequestOptions,
  "headers" | "auth" | "agent" | "timeout" | "maxHeaderSize"
> & {
  /**
   * Boolean indicating whether the image filename will be automatically extracted
   * from `options.url` or not. Set to `false` to have `options.dest` without a
   * file extension for example.
   * @default true
   */
  extractFilename?: boolean;

  /**
   * The maximum number of allowed redirects; if exceeded, an error will be emitted.
   * @default 21
   */
  maxRedirects?: number;
};

type DownloadResult = {
  /**
   * The downloaded filename
   */
  filename: string;
};

export class TimeoutError extends Error {
  constructor() {
    super("TimeoutError");
  }
}

// Allowed image mime types
// Twitter allows JPG,PNG,GIF,WEBP. Reference here: https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/uploading-media/media-best-practices
const mimeTypesAllowed = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // "image/bmp",
  // "image/svg+xml",
];

export default class ImageDownloader {
  constructor() {}

  /**
   * Download an image from url
   * @param url The image URL to download
   * The image destination. Can be a directory or a filename.
   * If a directory is given, ID will automatically extract the image filename
   * from `options.url`
   * @param fileName
   * @param options
   * @returns filePath of the image downloaded
   */
  static downloadImage = (
    url: string,
    directory: string,
    fileName: string,
    { extractFilename, ...options }: Options
  ) => {
    if (typeof extractFilename === "undefined") {
      extractFilename = true;
    }
    if (!url) {
      return Promise.reject(new Error("url is required"));
    }
    if (!directory) {
      return Promise.reject(new Error("upload directory is required"));
    }
    if (!fileName) {
      return Promise.reject(new Error("filename is required"));
    }

    /*if (extractFilename) {
      if (!path.extname(dest)) {
        const Url = new URL(url);
        const pathname = Url.pathname;
        const basename = path.basename(pathname);
        const decodedBasename = decodeURIComponent(basename);

        dest = path.join(dest, decodedBasename);
      }
    }*/
    let dest = path.join(directory, fileName);
    if (!path.isAbsolute(dest)) {
        dest = path.resolve(__dirname, dest);
    }

    return this.requestWithRedirects(url, dest, options);
  };

  private static requestWithRedirects = async (
    url: string,
    filePath: string,
    options: Options
  ): Promise<DownloadResult> => {
    return new Promise((resolve, reject) => {
      const request = url.trimStart().startsWith("https") ? https : http;

      request
        .get(url, options, (res) => {
          if (res.statusCode !== 200) {
            // Consume response data to free up memory
            res.resume();
            reject(
              new Error("Request Failed.\n" + `Status Code: ${res.statusCode}`)
            );

            return;
          }

          const contentType = res.headers["content-type"];
          const contentLength = res.headers["content-length"];
          if (!contentType) {
            return reject(new Error("Can't determine content-type of image"));
          }

          if (!mimeTypesAllowed.includes(contentType.toLowerCase())) {
            return reject(
              new Error(`File with mime-type ${contentType} is not allowed`)
            );
          }

          // TODO: Limit image size
          // Twitter image size limits: Image size <= 5 MB, animated GIF size <= 15 MB
          // Reference here: https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/uploading-media/media-best-practices

          const extension = mime.extension(contentType) || "png";
          if (path.extname(filePath)) {
            filePath = filePath.substring(0, filePath.lastIndexOf("."));
          }
          // Add the extension from the mimeType
          filePath += `.${extension}`;

          res
            .pipe(createWriteStream(filePath))
            .on("error", reject)
            .once("close", () => resolve({ filename: filePath }));
        })
        .on("timeout", () => reject(new TimeoutError()))
        .on("error", reject);
    });
  };
}
