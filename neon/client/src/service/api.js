import axios from 'axios';


export async function addPost(url, postData) {

  let response = await axios.post(url, postData);
  
  return response;
}