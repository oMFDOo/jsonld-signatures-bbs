/*
 * Copyright 2020 - MATTR Limited
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO need to fix this

import {
  Bls12381G2KeyPair,
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  deriveProof,
} from "@mattrglobal/jsonld-signatures-bbs";

import { extendContextLoader, sign, verify, purposes } from "jsonld-signatures";

import inputDocument from "./data/inputDocument.json";
import inputDocument2 from "./data/inputDocument2.json";
import keyPairOptions from "./data/keyPair.json";
import keyPairOptions2 from "./data/keyPair2.json";
import exampleControllerDoc from "./data/controllerDocument.json";
import exampleControllerDoc2 from "./data/controllerDocument2.json";
import bbsContext from "./data/bbs.json";
// ProofFrame
import revealDocument from "./data/deriveProofFrame.json";
import revealDocument2 from "./data/deriveProofFrame2.json";
import citizenVocab from "./data/citizenVocab.json";
import credentialContext from "./data/credentialsContext.json";
// Jwk, Jws ~
import suiteContext from "./data/suiteContext.json";
import { generateKeyPair } from "crypto";
import { RSAKeyPair } from "crypto-ld";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents = {
  "did:example:489398593#test": keyPairOptions,
  "did:example:489398593": exampleControllerDoc,
  "https://w3id.org/security/bbs/v1": bbsContext,
  "https://w3id.org/citizenship/v1": citizenVocab,
  "https://www.w3.org/2018/credentials/v1": credentialContext,
  "https://w3id.org/security/suites/jws-2020/v1": suiteContext,
};
const documents2 = {
  "did:example:489398594#test": keyPairOptions2,
  "did:example:489398594": exampleControllerDoc2,
  "https://w3id.org/security/bbs/v1": bbsContext,
  "https://w3id.org/citizenship/v1": citizenVocab,
  "https://www.w3.org/2018/credentials/v1": credentialContext,
  "https://w3id.org/security/suites/jws-2020/v1": suiteContext,
};
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */


var cnt = 0;

const customDocLoader = (url) => {
  if (cnt % 2 == 0) {
    const context = documents[url];
    console.log("url1 : ", url);
  
    if (context) {
      return {
        // 이것은 링크 헤더를 통한 컨텍스트를 위한 것입니다.
        contextUrl: null, // this is for a context via a link header
        // 이것은 로드된 실제 문서입니다.
        document: context, // this is the actual document that was loaded
        // 리디렉션 후의 실제 컨텍스트 URL입니다.
        documentUrl: url, // this is the actual context URL after redirects
      };
    }
  }
  else {
    const context = documents2[url];
    console.log("url2 : ", url);
  
    if (context) {
      return {
        // 이것은 링크 헤더를 통한 컨텍스트를 위한 것입니다.
        contextUrl: null, // this is for a context via a link header
        // 이것은 로드된 실제 문서입니다.
        document: context, // this is the actual document that was loaded
        // 리디렉션 후의 실제 컨텍스트 URL입니다.
        documentUrl: url, // this is the actual context URL after redirects
      };
    }

  }

  console.log(
    `Attempted to remote load context : '${url}', please cache instead`
  );
  throw new Error(
    `Attempted to remote load context : '${url}', please cache instead`
  );
};



//Extended document load that uses local contexts
//로컬 컨텍스트를 사용하는 확장 문서 로드
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */


const main = async () => {
  const documentLoader = extendContextLoader(customDocLoader);
  console.log("이고얌 : ", documentLoader);

  //Import the example key pair
  // 예제 키 쌍 가져오기
  const keyPair = await new Bls12381G2KeyPair(keyPairOptions);
  const keyPair2 = await new Bls12381G2KeyPair(keyPairOptions2);

  console.log("Input document : 기본 VC1");
  console.log(JSON.stringify(inputDocument, null, 2));
  console.log("Input document : 기본 VC2");
  console.log(JSON.stringify(inputDocument2, null, 2));

  //Sign the input document
  // 입력 문서에 서명 : Issuer1
  let signedDocument = await sign(inputDocument, {
    suite: new BbsBlsSignature2020({ key: keyPair }),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });
  cnt++;

  // 입력 문서에 서명 : Issuer2
  let signedDocument2 = await sign(inputDocument2, {
    suite: new BbsBlsSignature2020({ key: keyPair2 }),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });
  cnt++;
  


  console.log("Input document with proof : Issuer1 서명 결과");
  console.log("type : " + typeof(signedDocument));
  console.log(JSON.stringify(signedDocument, null, 2));
  
  console.log("Input document with proof : Issuer2 서명 결과");
  console.log("type : " + typeof(signedDocument2));
  console.log(JSON.stringify(signedDocument2, null, 2));

  
  /* #region VC 변형 테스트 */

  // VC 변형 테스트 1 - 데이터 변형
  // let change = JSON.stringify(signedDocument, null, 2).toString().replace(/Jinju/g, 'Chacha');
  // console.log(change);
  // change = JSON.parse(change);
  // signedDocument = change;

  // VC 변형 테스트 1 - 데이터 누락
  // let change = JSON.stringify(signedDocument, null, 2).toString().replace(/"givenName": "Jinju",/g, '');
  // console.log("변형 내용");
  // console.log(change);
  // change = JSON.parse(change);
  // signedDocument = change;

  /* #endregion */

  //Verify the proof
  //증명 확인 : Issuer1
  let verified = await verify(signedDocument, {
    suite: new BbsBlsSignature2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });
  cnt++;

  //증명 확인 : Issuer2
  let verified2 = await verify(signedDocument2, {
    suite: new BbsBlsSignature2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });
  cnt++;


  console.log("Verification result : Issuer1의 일반 VC 검증 결과");
  console.log(JSON.stringify(verified, null, 2));

  console.log("Verification result : Issuer2의 일반 VC 검증 결과");
  console.log(JSON.stringify(verified2, null, 2));

  /* #region Proof 생성 전 VP 변형 테스트 */
 
  // VP 변형 테스트 2
  // let change = JSON.stringify(signedDocument, null, 2).toString().replace(/Jinju/g, 'Chacha');
  // console.log("변형 내용");
  // console.log(change);
  // change = JSON.parse(change);
  // signedDocument = change;
  
  // VC 변형 테스트 2 - 데이터 누락
  // let change = JSON.stringify(signedDocument, null, 2).toString().replace(/"gender": "Female",/g, '');
  // console.log("변형 내용");
  // console.log(change);
  // change = JSON.parse(change);
  // signedDocument = change;

  /* #endregion */


  //Derive a proof
  // 증명 도출 : Issuer1의 VC를 이용한 서명 확장 ==> VP
  let derivedProof = await deriveProof(signedDocument, revealDocument, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });
  cnt++;

  // 증명 도출 : Issuer2의 VC를 이용한 서명 확장 ==> VP
  let derivedProof2 = await deriveProof(signedDocument2, revealDocument2, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });
  cnt++;
  
  console.log("Verifying Derived Proof : Issuer1을 이용한 파생 증명 확인");
  console.log(JSON.stringify(derivedProof, null, 2));
  console.log("Verifying Derived Proof : Issuer2를 이용한 파생 증명 확인");
  console.log(JSON.stringify(derivedProof2, null, 2));


  /* #region VP 변형 테스트 */
 
  // VP 변형 테스트 3
  // let change = JSON.stringify(derivedProof, null, 2).toString().replace(/Jinju/g, 'Chacha');
  // console.log(change);
  // change = JSON.parse(change);
  // derivedProof = change;
  
  // VC 변형 테스트 3 - 데이터 누락
  // let change = JSON.stringify(derivedProof, null, 2).toString().replace(/"gender": "Female",/g, '');
  // console.log("변형 내용");
  // console.log(change);
  // change = JSON.parse(change);
  // derivedProof = change;

  // Issuer DID 변경
  // let change = JSON.stringify(derivedProof, null, 2).toString().replace(/489398593/g, '489398585');
  // console.log(change);
  // change = JSON.parse(change);
  // derivedProof = change;

  /* #endregion */

  //Verify the derived proof
  // Issuer 1의 파생된 증명 확인
  verified = await verify(derivedProof, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });
  cnt++;
  // Issuer 2의 파생된 증명 확인
  verified = await verify(derivedProof2, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });
  cnt++;

  console.log("Verification result : VP1의 derivedProof 검증 결과");
  console.log(JSON.stringify(verified, null, 2));

  console.log("Verification result : VP2의 derivedProof 검증 결과");
  console.log(JSON.stringify(verified2, null, 2));
};

main();
