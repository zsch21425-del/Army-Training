const path = require('path')
const fs = require('fs')
const { app, safeStorage } = require('electron')

function configDir() {
  const dir = app.getPath('userData')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}
function configPath() { return path.join(configDir(), 'config.json') }
function magazinesPath() { return path.join(configDir(), 'magazines.json') }

function readJSON(p, fallback) {
  try {
    if (!fs.existsSync(p)) return fallback
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return fallback
  }
}
function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2))
}

function saveApiKey(key) {
  const config = readJSON(configPath(), {})
  if (key && safeStorage.isEncryptionAvailable()) {
    config.apiKeyEncrypted = safeStorage.encryptString(key).toString('base64')
    delete config.apiKeyPlain
  } else if (key) {
    config.apiKeyPlain = key
    delete config.apiKeyEncrypted
  } else {
    delete config.apiKeyEncrypted
    delete config.apiKeyPlain
  }
  writeJSON(configPath(), config)
}

function loadApiKey() {
  const config = readJSON(configPath(), {})
  if (config.apiKeyEncrypted && safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(config.apiKeyEncrypted, 'base64'))
    } catch {
      return ''
    }
  }
  return config.apiKeyPlain || ''
}

function hasApiKey() {
  return Boolean(loadApiKey())
}

function loadMagazines() {
  return readJSON(magazinesPath(), [])
}

function saveMagazines(magazines) {
  writeJSON(magazinesPath(), magazines)
}

module.exports = { saveApiKey, loadApiKey, hasApiKey, loadMagazines, saveMagazines }
