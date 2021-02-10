export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (!bytes) return '0 Byte'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  if (!i) return bytes + ' ' + sizes[i]
  return Math.round(bytes / Math.pow(1024, i).toFixed(1)) + ' ' + sizes[i]
}
