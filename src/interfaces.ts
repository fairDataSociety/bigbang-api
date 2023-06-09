/**
 * Structure to proof ownership of an invite
 */
export interface InviteCreate {
  /**
   * ETH address of the user who created the invite, prefixed with '0x'
   */
  inviter_address: string

  /**
   * An invite address, prefixed with '0x'
   */
  invite_address: string

  /**
   * Signature of the `invite_address` content using private key of `inviter_address`
   */
  inviter_signature: string

  /**
   * Signature of the `inviter_address` content using private key of `invite_address`
   */
  invite_signature: string
}

/**
 * Structure to proof ownership of an invite and link it to a new account
 */
export interface InviteLink {
  /**
   * An invite address (prefixed with '0x')
   */
  invite_address: string

  /**
   * New account address (prefixed with '0x')
   */
  account_address: string

  /**
   * Signature of the `account_address` content using private key of `invite_address`
   */
  invite_signature: string

  /**
   * Signature of the `invite_address` content using private key of `account_address`
   */
  account_signature: string
}

/**
 * Structure to proof ownership of an invite and link it to a new account
 */
export interface InviteLogin {
  /**
   * An invite address (prefixed with '0x')
   */
  invite_address: string

  /**
   * Signature of the login magic text using private key of `invite_address`
   */
  invite_signature: string
}
