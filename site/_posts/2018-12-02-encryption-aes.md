---
title: Java 和 js 互加解密(1) — AES对称加密算法
---

# Java 和 js 互加解密(1) — AES对称加密算法

<post-meta date="2018-12-02" style="margin-bottom: 1rem" />

本文整理了 Java 和 js 关于AES算法的互加解密，方便开发使用。部分代码来源于网络。

js 前台加密数据，Java 后台解密数据。

<img :src="$page.baseUrl + 'assets/img/20181202/encryption-aes/results-screenshots.png'" alt="Java 和 js 互加解密 — AES对称加密">

Java 和 js 互加解密 — AES对称加密

## AES算法简介

> **高级加密标准**（英语：**A**dvanced **E**ncryption **S**tandard，缩写：AES），在密码学中又称**Rijndael加密法**，是美国联邦政府采用的一种区块加密标准。这个标准用来替代原先的DES，已经被多方分析且广为全世界所使用。经过五年的甄选流程，高级加密标准由美国国家标准与技术研究院（NIST）于2001年11月26日发布于FIPS PUB 197，并在2002年5月26日成为有效的标准。2006年，高级加密标准已然成为[对称密钥加密](https://zh.wikipedia.org/wiki/%E5%AF%B9%E7%A7%B0%E5%AF%86%E9%92%A5%E5%8A%A0%E5%AF%86)中最流行的算法之一。

更多信息请查阅维基词条：[高级加密标准](https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86)

## Java实现AES加解密

该工具类基于 jdk1.8 进行封装，如果你的 jdk 低于1.8，部分代码可能需要做一定的调整（如Base64编码解码）

```java
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * AES加解密的工具类
 *
 * @author hxulin
 */
public final class AESUtils {

    /**
     * 字符编码
     */
    private static final String CHARACTER_ENCODING = "utf-8";

    /**
     * 生成密钥的基本字符
     */
    private static final String BASE_CHARACTER = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private AESUtils() {

    }

    /**
     * 生成随机密钥
     *
     * @return 随机密钥
     */
    public static String initKey() {
        return generateKeyOrIV();
    }

    /**
     * 生成初始向量
     *
     * @return 初始向量
     */
    public static String initIV() {
        return generateKeyOrIV();
    }

    /**
     * 生成随机密钥、初始向量
     */
    private static String generateKeyOrIV() {
        StringBuilder sBuilder = new StringBuilder();
        double r;
        for (int i = 0; i < 16; i++) {
            r = Math.random() * BASE_CHARACTER.length();
            sBuilder.append(BASE_CHARACTER.charAt((int) r));
        }
        return sBuilder.toString();
    }

    /**
     * 使用AES算法加密字符串
     *
     * @param data 需要加密的原文
     * @param key  密钥(16位字母、数字或符号)
     * @param iv   初始向量(16位字母、数字或符号)，使用CBC模式，需要一个向量iv，可增加加密算法的强度
     * @return 加密后进行Base64的密文
     * @throws Exception 加密失败
     */
    public static String encrypt(String data, String key, String iv) throws Exception {
        return Base64.getEncoder().encodeToString(encrypt(data.getBytes(CHARACTER_ENCODING), key, iv));
    }

    /**
     * 使用AES算法加密数据
     *
     * @param data 需要加密的数据
     * @param key  密钥(16位字母、数字或符号)
     * @param iv   初始向量(16位字母、数字或符号)，使用CBC模式，需要一个向量iv，可增加加密算法的强度
     * @return 加密后的数据
     * @throws Exception 加密失败
     */
    public static byte[] encrypt(byte[] data, String key, String iv) throws Exception {
        return crypto(Cipher.ENCRYPT_MODE, data, key, iv);
    }

    /**
     * 使用AES算法解密字符串
     *
     * @param data 需要解密的密文
     * @param key  密钥(16位字母、数字或符号)
     * @param iv   初始向量(16位字母、数字或符号)
     * @return 解密后的明文
     * @throws Exception 解密失败
     */
    public static String decrypt(String data, String key, String iv) throws Exception {
        byte[] decrypted = decrypt(Base64.getDecoder().decode(data), key, iv);
        return new String(decrypted, CHARACTER_ENCODING);
    }

    /**
     * 使用AES算法解密数据
     *
     * @param data 需要解密的数据
     * @param key  密钥(16位字母、数字或符号)
     * @param iv   初始向量(16位字母、数字或符号)
     * @return 解密后的数据
     * @throws Exception 解密失败
     */
    public static byte[] decrypt(byte[] data, String key, String iv) throws Exception {
        return crypto(Cipher.DECRYPT_MODE, data, key, iv);
    }

    /**
     * 加解密数据
     */
    private static byte[] crypto(int opmode, byte[] content, String key, String iv) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(CHARACTER_ENCODING), "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");  // 算法/模式/补码方式
        IvParameterSpec ivParameterSpec = new IvParameterSpec(iv.getBytes(CHARACTER_ENCODING));
        cipher.init(opmode, keySpec, ivParameterSpec);
        return cipher.doFinal(content);
    }

}
```

使用样例：
```java
@Test
public void test() throws Exception {
    String key = AESUtils.initKey();
    System.out.println("生成密钥：" + key);
    String iv = AESUtils.initIV();
    System.out.println("生成初始向量：" + iv);
    String content = "你好师姐";  // 待加密内容
    String encrypt = AESUtils.encrypt(content, key, iv);
    System.out.println("明文内容："+ content);
    System.out.println("加密结果："+ encrypt);
    System.out.println("解密结果："+ AESUtils.decrypt(encrypt, key, iv));
}
```

运行结果：
> 生成密钥：grXBjElVVSJd4QSq
>
> 生成初始向量：DmuZulkW1x240brw
>
> 明文内容：你好师姐
>
> 加密结果：BqbUwVOXJMwwtB4CquWsLA==
>
> 解密结果：你好师姐


## js实现AES加解密

前端 js 实现AES加解密，依赖第三方库：[CryptoJS](https://github.com/sytelus/CryptoJS)

```javascript
/**
 * AES加密
 *
 * @param content 待加密的内容
 * @param secretKey 密钥
 * @param iv 初始向量
 * @returns {string} 加密结果
 */
function aesEncrypt(content, secretKey, iv) {
    return CryptoJS.AES.encrypt(content, CryptoJS.enc.Utf8.parse(secretKey), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
}

/**
 * AES解密
 *
 * @param content 待解密的内容
 * @param secretKey 密钥
 * @param iv 初始向量
 * @returns {string} 解密结果
 */
function aesDecrypt(content, secretKey, iv) {
    return CryptoJS.AES.decrypt(content, CryptoJS.enc.Utf8.parse(secretKey), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
}
```

完整项目地址：[https://github.com/hxulin/encryption](https://github.com/hxulin/encryption)

（完）