import { isSignatureCorrect } from '../../../src/utils/signature'

describe('signature', () => {
  it('isSignatureCorrect', async () => {
    const items = [
      {
        signerAddress: '0x680C1ED5CEd1DBDBf99ECDdfCF714bff144B1618',
        signature:
          '0x1b5d80041e6991e71b83c7b4f691a93622176299aba6f5da048dddc052dad40a514e7408618e85757a50d121149872810aaf0c440788516e1d7a2c40a0b5fe3b1b',
        message: '0x305432e1dc085c16f0ca24e6c3824f366cdccf4b',
        isCorrect: true,
      },
      {
        signerAddress: '0xDA7dFEB86F2e0566c7Cd3Db2160544A5106e761b',
        signature:
          '0xb4d890de65a808cb7e398f592637cf47db69033702c885f1cfb46d993cd5b89256d421956db9176ea10cc406d793f7a257d4b1129dad5fd1e4c4c7ba979ee7331c',
        message: '0x839bdedd48b9a241bc38ad241719b58126d16262',
        isCorrect: true,
      },
      {
        signerAddress: '0x541c463902a9848e2340f5f4f9b63B6617b4c8BF',
        signature:
          '0x738a517380b38d6f65adf0ce2342fe98a6fe893588aa91c09c1a67fe7e3e5bcf0feee29636f2a9efbfaeee6c59a3d63cac8a18b33877111d73641c7bcfa6ed021c',
        message: '0x94635eedd352722f747512ac916a78382b65d062',
        isCorrect: true,
      },
      {
        signerAddress: '0x9BBBb42777Df0D10a1ca632E410D5c24f5207538',
        signature:
          '0xc71dcedf33410f9e5f28c310459311d0ebb4b8168fb2e1dd85663b3e7b63c2004a33eb58bb7f5510adbea7d34ab20ff69a29d3a5798376ac3f0e3122a0bbda5e1b',
        message: '0xca2803264f8b6ba20964a722e7572fec2e1ba508',
        isCorrect: true,
      },
      {
        signerAddress: '0xD01Db00A8F5ba03662E2248A532532F62e8597c7',
        signature:
          '0xe791f7e15af9880e340ec81910b38da2e3c12b9db789dc464d71146a3912f54548de5ebbc43d3dd7ea66d30bd25a83dd52f9615067ce15241c5e607023f0e0d41b',
        message: '0x74a42a2021015e002349123c49fc7327322d314f',
        isCorrect: true,
      },
      {
        signerAddress: '0xf73bCa5338a4E5a1ae862F223Bd466DfDc369E4D',
        signature:
          '0x3211c9027e616837aa315eaa931b3bfcf5024426f89b6de0347bf17cf3e8f6b80f2176b7344b0819fb14eb3b87d9ae72052a4df90ebffffb292618ad2a7974a81b',
        message: '0xca318324b85efd613b8d3cc0e2eeea59b4204ad3',
        isCorrect: true,
      },
      {
        signerAddress: '0xA74b913d89172C8279C0f882627890313Fa4F06c',
        signature:
          '0xf80e638d93be9a93abeae0945f73036e83e61953febb3250eb063296fb1b2d0e7d18859b0e0abbe97b5361e7490cfe8277e6c72d0683f0f6eb4fef45ac1532731c',
        message: '0x47836daf4c536f4e56dc2f73a479df41168f7501',
        isCorrect: true,
      },
      {
        signerAddress: '0xC3Eef2250C4C9290F4021b4F78985f1e5Fb9b4d2',
        signature:
          '0x7942373ee6c49b03f26287fc68c247de0155f238216fd1a912dbb7e8450728197a6d88fe4f887021123f462102a49f1a9dbc20a3cf42a7152fb56a955f6d0d9a1b',
        message: '0x5d63fd2fbf86930974bc9d3ca7f2378dc9479fdb',
        isCorrect: true,
      },
      {
        signerAddress: '0x3c7b660047a89813CD0e62561c79938999F9F066',
        signature:
          '0xf916920e24ca6e569ffba33f926681ea8d4e901bc8cd54d85e730603bda6cff201116b14e8eb7ea35bd84ebd02b9e0c97ab70ae05eec660fa86baa29fd5eda4d1b',
        message: '0xc0a2c2c126f36f1cb72b29d2801988146b90e75f',
        isCorrect: true,
      },
      {
        signerAddress: '0xB5b7143Bd4e37868b2eEbB733648028727f347C5',
        signature:
          '0xea4b6822a36d42e29fd6ed72f93aef6e4547fd5f2965bd7bc802ba5b70457e0c5f084e11d12ccdb8c29ff2f2530d5c91f5866894c4abfb6e2eabf311a2adc1881b',
        message: '0x0e13b2e1a4a8d87284af174e019a82b9adf540d9',
        isCorrect: true,
      },
      {
        // some letters are lowercased
        signerAddress: '0xb5b7143Bd4e37868b2eEbB733648028727f347c5',
        signature:
          '0xea4b6822a36d42e29fd6ed72f93aef6e4547fd5f2965bd7bc802ba5b70457e0c5f084e11d12ccdb8c29ff2f2530d5c91f5866894c4abfb6e2eabf311a2adc1881b',
        message: '0x0e13b2e1a4a8d87284af174e019a82b9adf540d9',
        isCorrect: true,
      },
      {
        signerAddress: '0xB5b7143Bd4e37868b2eEbB733648028727f347C5',
        // no signature
        signature: '',
        message: '0x0E13b2e1a4A8D87284af174E019a82B9aDf540d9',
        isCorrect: false,
      },
      {
        signerAddress: '0xB5b7143Bd4e37868b2eEbB733648028727f347C5',
        // partial signature
        signature: '0xea4b6822a36d42e29fd6ed72f93aef6e4547fd5f2965bd7bc802ba5b70457e0',
        message: '0x0E13b2e1a4A8D87284af174E019a82B9aDf540d9',
        isCorrect: false,
      },
      {
        // changed last symbol
        signerAddress: '0x3c7b660047a89813CD0e62561c79938999F9F065',
        signature:
          '0xf916920e24ca6e569ffba33f926681ea8d4e901bc8cd54d85e730603bda6cff201116b14e8eb7ea35bd84ebd02b9e0c97ab70ae05eec660fa86baa29fd5eda4d1b',
        message: '0xC0A2c2c126f36F1cb72B29d2801988146B90e75f',
        isCorrect: false,
      },
      {
        signerAddress: '0x680C1ED5CEd1DBDBf99ECDdfCF714bff144B1618',
        signature:
          '0x1b5d80041e6991e71b83c7b4f691a93622176299aba6f5da048dddc052dad40a514e7408618e85757a50d121149872810aaf0c440788516e1d7a2c40a0b5fe3b1b',
        // uppercased last letter
        message: '0x305432e1dc085c16f0ca24e6c3824f366cdccf4B',
        isCorrect: false,
      },
      {
        signerAddress: '',
        signature: '',
        message: '',
        isCorrect: false,
      },
    ]

    items.forEach(({ signerAddress, signature, message, isCorrect }) => {
      expect(isSignatureCorrect(signerAddress, signature, message)).toBe(isCorrect)
    })
  })
})
