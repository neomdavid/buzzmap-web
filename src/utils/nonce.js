// Nonce generation utility for CSP
let nonce = null;

export const generateNonce = () => {
  if (!nonce) {
    // Generate a random nonce
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return nonce;
};

export const getNonce = () => {
  return nonce || generateNonce();
};

// Function to apply nonce to style elements
export const createStyleElement = (css, nonce) => {
  const style = document.createElement('style');
  style.nonce = nonce;
  style.textContent = css;
  return style;
};

// Function to apply nonce to script elements
export const createScriptElement = (js, nonce) => {
  const script = document.createElement('script');
  script.nonce = nonce;
  script.textContent = js;
  return script;
};
