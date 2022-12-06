import pkceChallenge from 'pkce-challenge'
import * as localforage from 'localforage';

async function authorize() {
  let challenge = pkceChallenge();
  localforage.setItem('codeVerifier',challenge.code_verifier);
  localforage.setItem('codeChallenge',challenge.code_challenge);
  //axios.post('http://localhost:8100/code', {codeVerifier:challenge.code_verifier});
  let opt = {
    client_id: '5ca13223-4cf7-4bf3-9ba9-a8b7fe9ccdd6',
    response_type: 'code',
    code_challenge: challenge.code_challenge,
    code_challenge_method: 'S256',
    scope: 'Files.Read Files.ReadWrite Files.ReadWrite.All Files.ReadWrite.AppFolder',
    redirect_uri: 'http://localhost:4200/home',
    state: '123'
  }
  let query = new URLSearchParams(opt)
  window.location.href = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?${query}`;
}

async function getToken(authCode, http) {
  let codeVerifier:string = await localforage.getItem('codeVerifier');

  var formData: any = new FormData();
  formData.append('grant_type', 'authorization_code');
  formData.append('code', authCode);
  formData.append('client_id', '5ca13223-4cf7-4bf3-9ba9-a8b7fe9ccdd6');
  formData.append('scope', 'Files.Read Files.ReadWrite Files.ReadWrite.All Files.ReadWrite.AppFolder');
  formData.append('redirect_uri', 'http://localhost:4200/home');
  formData.append('code_verifier', codeVerifier);
  formData.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');

  http.post("https://login.microsoftonline.com/consumers/oauth2/v2.0/token", formData )
    .subscribe(r => {
      localforage.setItem('token',r.access_token);
    });

}

export {authorize, getToken}