import { verifyMessage } from 'ethers'

/**
 * Check if ETH address is valid without checksum
 */
export function isEthAddress(address: string): boolean {
  return address.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check if the signature is valid
 */
export function isSignature(signature: string): boolean {
  return signature.length === 132 && /^0x[a-fA-F0-9]{130}$/.test(signature)
}

/**
 * Check if the signature is correct
 *
 * @param signerAddress ETH address with '0x' prefix
 * @param signature Signature of the `signedContent`
 * @param message Content that was signed
 */
export function isSignatureCorrect(signerAddress: string, signature: string, message: string): boolean {
  try {
    return verifyMessage(message.toLowerCase(), signature).toLowerCase() === signerAddress.toLowerCase()
  } catch (e) {
    return false
  }
}
