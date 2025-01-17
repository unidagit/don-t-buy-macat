import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import axios from 'axios';
import * as S from './postUpload.style';
import { useRef, useState } from 'react';
import UploadHeader from '../header/UploadHeader/UploadHeader';

function PostUpload() {
  const Upload_Input = useRef();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [image, setImgfile] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [userToken, setUserToken] = useState();
  const [accountName, setAccountName] = useState('');
  const [authorImg, setAuthorImg] = useState('');

  useEffect(() => {
    const userToken = localStorage.getItem('Access Token');
    const accountName = localStorage.getItem('Account Name');
    setUserToken(userToken);
    setAccountName(accountName);
  }, []);

  useEffect(() => {
    if (accountName) {
      axios({
        url: `https://mandarin.api.weniv.co.kr/profile/${accountName}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-type': 'application/json',
        },
      }).then((response) => {
        setAuthorImg(response.data.profile.image);
      });
    }
  }, [accountName]);

  useEffect(() => {
    if (text || imageUrl) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [text, imageUrl]);

  const handleChangeText = (e) => {
    setText(e.target.value);
  };

  const handleChangeFile = (e) => {
    const Blob = e.target.files[0];

    setImgfile((prevState) => [...prevState, Blob]);
    if (Blob === undefined) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(Blob);
    e.target.value = '';
    return new Promise((resolve) => {
      reader.onload = () => {
        setImageUrl((imageUrl) => [...imageUrl, reader.result]);
        resolve();
      };
    });
  };

  const imageUpload = async (files, index) => {
    const formData = new FormData();
    formData.append('image', files[index]);
    try {
      const res = await axios.post(
        `https://mandarin.api.weniv.co.kr/image/uploadfile`,
        formData,
      );
      return res.data['filename'];
    } catch {
      (err) => {
        console.log(err);
      };
    }
  };

  async function createPost() {
    const imageUrls = [];
    const files = image;
    for (let index = 0; index < files.length; index++) {
      const imgurl = await imageUpload(files, index);
      imageUrls.push(`https://mandarin.api.weniv.co.kr/${imgurl}`);
    }
    try {
      const res = await axios({
        url: `https://mandarin.api.weniv.co.kr/post`,
        method: 'post',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-type': 'application/json',
        },
        data: {
          post: {
            content: text,
            image: imageUrls + '',
          },
        },
      });
      navigate(`/profile/${accountName}`);
    } catch {
      (err) => console.log(err);
    }
  }

  const deleteImg = (index) => {
    const imgArr = image.filter((image, i) => i !== index);
    const imgNameArr = imageUrl.filter((image, i) => i !== index);

    setImgfile([...imgArr]);
    setImageUrl([...imgNameArr]);
  };

  return (
    <S.PostUploadWrapper
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        createPost(e);
      }}
    >
      <UploadHeader isValid={isValid} />
      <S.PostUploadFieldSet>
        <S.PostUploadLegend className="A11yHidden">
          게시글 작성 페이지
        </S.PostUploadLegend>
        <S.ProfileImageBox>
          <S.ProfileImage authorImg={authorImg} />
        </S.ProfileImageBox>
        <S.PostForm>
          <S.PostUploadLegendTxt className="A11yHidden">
            게시글을 입력하세요
          </S.PostUploadLegendTxt>
          <S.PostUploadTextarea
            name="postTxt"
            id="postTxt"
            type="text"
            onChange={handleChangeText}
            maxLength="200"
            placeholder={'게시글을 입력해주세요...'}
          />
          <S.PostFormContainer>
            {imageUrl &&
              imageUrl.map((image, i) => {
                return (
                  <S.Item key={i}>
                    <S.PreviewImage key={i} src={image} alt="이미지 미리보기" />
                    <S.ImageDeleteBtn
                      type="button"
                      onClick={() => deleteImg(i)}
                    />
                  </S.Item>
                );
              })}
            <S.UploadImg className="A11yHidden">
              게시글 이미지 업로드
            </S.UploadImg>
            <S.UploadInput
              className="A11yHidden"
              ref={Upload_Input}
              type="file"
              accept=".jpg, .gif, .png, .jpeg, .bmp, .tif, .heic"
              onChange={handleChangeFile}
            />
            <S.ImgUploadBtn
              onClick={() =>
                imageUrl.length >= 3
                  ? alert('이미지는 3개까지만 업로드할 수 있습니다.')
                  : Upload_Input.current.click()
              }
            />
          </S.PostFormContainer>
        </S.PostForm>
      </S.PostUploadFieldSet>
    </S.PostUploadWrapper>
  );
}

export default PostUpload;
