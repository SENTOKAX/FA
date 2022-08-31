import * as crypto from 'crypto'

const encryptPasswordWithSalt = (password: string) => {
  const salt = crypto.randomBytes(128).toString('base64')
  const saltedPassword = shaEncrypt(password, salt)
  return {
    password: saltedPassword,
    salt
  }
}

const shaEncrypt = (password : string, salt : string) => {
  const hash = crypto.createHmac('sha1', salt)
  hash.update(password)
  return hash.digest('hex')
}

const validatePassword = (password : string, salt : string, ciphertext : string) => {
  return ciphertext === shaEncrypt(password, salt)
}

export {
  encryptPasswordWithSalt,
  validatePassword
}
