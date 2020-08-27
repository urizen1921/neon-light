import React, { useState, useEffect } from 'react';
import authSvg from '../assets/update.svg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { updateUser, isAuth, getCookie, signout } from '../helpers/auth.js';
import { addPost } from '../service/api.js';


const Timeline = ({ history }) => {

  const [formData, setFormData] = useState({
    name: '',
    _id: '',
    email: '',
    password1: '',
    textChange: 'Update',
    role: ''
  });

  const [post, setPost] = useState('');
  const [data, setData] = useState({});
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const token = getCookie('token');
    console.log(token);
    axios
    .get(`${process.env.REACT_APP_API_URL}/user/${isAuth()._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      const { role, name, email, _id } = res.data;
      setFormData({ ...formData, role, name, email, _id });
      console.log(res);
    })
    .catch(err => {
      console.log(err.response);
      toast.error(`Error in your information: ${err.response}`);
      if(err.response === 401) {
        signout(() => {
          history.push('/login');
        });
      }
    });
  };

  const loadTimeLine = () => {

    if(formData.name !== '') {
      axios
      .get("http://localhost:8082/neon/api/all")
      .then(res => {
        console.log(res);
        console.log(res.data[0].likes.length);
        console.log(formData);
      });
    } else {
      toast.error('Not authorized.');
    }
  };

  const handleChange = (event) => {
    setPost(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSending(true);

  };

  const postMethod = async () => {

    addPost("http://localhost:8082/neon/api",
      {
        user: {
          userId: formData._id,
          userName: formData.name,
          userEmail: formData.email,
          role: formData.role
        },
        post: post,
        likes: null
      }
    );
    setPost('');
    setIsSending(false);

  };

  const reWrite = () => {
    setIsSending(false);
  }
  
  return (
    <div>
      <div>
        User: {formData.name}
      </div>
      <div>
        <button
          className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3
          bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
          onClick={loadTimeLine}
        >
          <i className='fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500' />
          <span className='ml-4'>Load Timeline</span>
        </button>
      </div>
      <div>
        <form
          className='w-full flex-1 mt-8 text-indigo-500'
          onSubmit={handleSubmit}
        >
          <h2>
            POST
          </h2>
          <input
            className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5'
            type='text'
            placeholder='Your Post'
            onChange={handleChange}
            value={post}
          />
          {!isSending ? (
            <button
              type='submit'
              className='mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none'
            >
              <i className='fas fa-user-plus fa 1x w-6  -ml-2' />
              <span className='ml-3'>Send it</span>
            </button>
          ) : null
          }
        </form>
      </div>
      <div>
      {isSending ? (
        <div>
          <button
            className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3
            bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
            onClick={postMethod}
          >
            <i className='fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500' />
            <span className='ml-4'>Send</span>
          </button>
          <button
          className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3
          bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
          onClick={reWrite}
        >
          <i className='fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500' />
          <span className='ml-4'>Re-Write</span>
        </button>
        </div>
      ) : null
      }
      </div>
    </div>
  )
}

export default Timeline;
