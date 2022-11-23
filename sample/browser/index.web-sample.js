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
import keyPairOptions from "./data/keyPair.json";
import exampleControllerDoc from "./data/controllerDocument.json";
import bbsContext from "./data/bbs.json";
// ProofFrame
import revealDocument from "./data/deriveProofFrame.json";
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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const customDocLoader = (url) => {
  const context = documents[url];

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

  console.log(
    `Attempted to remote load context : '${url}', please cache instead`
  );
  throw new Error(
    `Attempted to remote load context : '${url}', please cache instead`
  );
};

//Extended document load that uses local contexts
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
//로컬 컨텍스트를 사용하는 확장 문서 로드
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documentLoader = extendContextLoader(customDocLoader);


const main = async () => {
  //Import the example key pair
  // 예제 키 쌍 가져오기
  const keyPair = await new Bls12381G2KeyPair(keyPairOptions);
  let c = JSON.stringify(keyPair.toString(), null, 2).toString().replace(/"publicKey":"oq/g, '"publicKey":"fe');
  let myKey = keyPair;
  console.log("변경 전 : ", keyPair);
  // myKey.publicKey = myKey.publicKey.toString().replace(/R/g, 's');
  console.log("변경 후 : ", JSON.stringify(c, null, 2));

  console.log("Input document : 기본 VC");
  console.log(JSON.stringify(inputDocument, null, 2));

  //Sign the input document
  //입력 문서에 서명
  // keyPair : Bls12381G2KeyPair
  let signedDocument = await sign(inputDocument, {
    suite: new BbsBlsSignature2020({ key: keyPair }),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Input document with proof : Issuer 서명 결과");
  console.log("type : " + typeof(signedDocument));
  console.log(JSON.stringify(signedDocument, null, 2));
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

  //Verify the proof
  //증명 확인
  let verified = await verify(signedDocument, {
    suite: new BbsBlsSignature2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });


  console.log("Verification result : 일반 VC 검증 결과");
  console.log(JSON.stringify(verified, null, 2));

  //Derive a proof
  //증명 도출 : 서명 확장==> VP
  let derivedProof = await deriveProof(signedDocument, revealDocument, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });
  
  console.log("Verifying Derived Proof : 파생 증명 확인");
  console.log(JSON.stringify(derivedProof, null, 2));

  // console.log("키생성")
  // var myKey = generateKeyPair({
  //   bits: 2048,
  //   e: 0x10001,
  //   workers: -1
  // }, (err, keyPair) => {
  // });
  // console.log("공개키", myKey.publicKey);
  // console.log("비밀키", myKey.privateKey);
    
  // VP 변형 테스트 2
  // let change = JSON.stringify(derivedProof, null, 2).toString().replace(/Jinju/g, 'Chacha');
  // console.log(change);
  // change = JSON.parse(change);
  // derivedProof = change;
  
  // VC 변형 테스트 2 - 데이터 누락
  let change = JSON.stringify(derivedProof, null, 2).toString().replace(/"gender": "Female",/g, '');
  console.log("변형 내용");
  console.log(change);
  change = JSON.parse(change);
  derivedProof = change;

  // Issuer DID 변경
  // let change = JSON.stringify(derivedProof, null, 2).toString().replace(/489398593/g, '489398585');
  // console.log(change);
  // change = JSON.parse(change);
  // derivedProof = change;

  //Verify the derived proof
  // 파생된 증명 확인
  verified = await verify(derivedProof, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Verification result : derivedProof 검증 결과");
  console.log(JSON.stringify(verified, null, 2));
};

main();
