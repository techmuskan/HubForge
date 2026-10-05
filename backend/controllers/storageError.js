function storageErrorMessage(error) {
  if (error?.code === "EACCES" || error?.errors?.some((item) => item.code === "EACCES")) {
    return "Cannot reach AWS S3 on port 443. Check your internet connection, firewall, VPN, or network policy.";
  }
  if (error?.name === "NoSuchBucket") return "The configured S3 bucket does not exist.";
  if (error?.name === "AccessDenied") return "AWS denied access to this S3 bucket. Check the IAM permissions and bucket policy.";
  return "Unable to connect to repository storage.";
}

module.exports = { storageErrorMessage };
