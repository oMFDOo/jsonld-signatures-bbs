# BBS 서명의 검증

#### 서명 검증 테스트는 아래 명시 된 두 개의 파일을 이용했습니다.

 - index.web-sample.js : 테스트 코드
 - data 폴더 내부 json 파일 : 테스트를 위한 사용자 관련 정보

<br>

테스트 내용 및 실행 방법은 [해당 문서](https://github.com/oMFDOo/jsonld-signatures-bbs/blob/master/document/BBS%EC%84%9C%EB%AA%85%20%EA%B2%80%EC%A6%9D%20%ED%85%8C%EC%8A%A4%ED%8A%B8_23.01.02_v0.5.pdf)로 확인할 수 있습니다. <br>
해당 테스트에 대해 발행된 [논문](https://github.com/oMFDOo/oMFDOo/blob/main/document/BBS%2B%EC%84%9C%EB%AA%85.pdf)을 확인할 수 있습니다.

<br>

# bbs-signatures-sample-browser

A simple runnable sample demoing how the API can be invoked in browser, output is shown in console of browser

Run the following and navigate to developer tools in browser to observe the output

```
yarn install --frozen-lockfile
yarn demo
open http://localhost:8080
```
