function setCookie(key: string, value: string, expSecond: number, domain?: string) {//t为秒
  const exp: any = new Date();
  exp.setTime(exp.getTime() + expSecond * 1000);
  document.cookie = `${key}=${value};expires=${exp.toGMTString()};path=/;domain=${domain || window.location.hostname}`;
}

function getCookie(key: string) {//获取指定名称的cookie的值
  let arr1 = document.cookie.split('; ');
  for (let i=0; i<arr1.length; i++) {
    let arr2 = arr1[i].split('=');
    if (arr2[0] == key) {
        return arr2[1];
    }
  }
}

//删除cookies
function delCookie(key: string) { 
  let exp: any = new Date(); 
  exp.setTime(exp.getTime() - 1); 
  let cval = getCookie(key); 
  if(cval != null) {
    document.cookie = `${key}=${cval};expires=${exp.toGMTString()}`; 
  }
}

export const Cookie = {
  setCookie,
  getCookie,
  delCookie
}

export default Cookie;
