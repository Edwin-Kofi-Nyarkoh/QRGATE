declare module 'otp-generator' {
    const otpGenerator: {
      generate: (
        length: number,
        options?: {
          digits?: boolean;
          lowerCaseAlphabets?: boolean;
          upperCaseAlphabets?: boolean;
          specialChars?: boolean;
        }
      ) => string;
    };
  
    export default otpGenerator;
  }
  