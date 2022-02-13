import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "yyjtube/images",
  acl: "public-read",
});

export const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "yyjtube/videos",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
});

export default s3;
