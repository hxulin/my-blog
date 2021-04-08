---
title: Java 和 js 互加解密(2) — RSA非对称加密算法
---

# Java 和 js 互加解密(2) — RSA非对称加密算法

<post-meta date="2018-12-08" style="margin-bottom: 1rem" />

本文整理了 Java 和 js 关于RSA算法的互加解密，方便开发使用。部分代码来源于网络。

> 公钥加密，私钥解密（同一公钥加密相同的数据，加密结果一般不同，与填充方式有关）
>
> 私钥加密，公钥解密（同一私钥加密相同的数据，加密结果一定相同）
>
> 私钥签名，公钥验签

<img :src="$withBase('/assets/img/20181208/encryption-rsa/results-screenshots.png')" alt="Java 和 js 互加解密 — RSA非对称加密">

Java 和 js 互加解密 — RSA非对称加密

## 开始之前

- 对称加密算法和非对称加密算法比较

  **对称加密算法：** 加解密使用相同的密钥，安全性较低，计算量较小，加解密效率较高

  **非对称加密算法：** 加解密使用不同的密钥，安全性较高，计算量较大，加解密效率较低，可以做数字签名

- 对称加密算法和非对称加密算法，怎么选择？

  参考HTTPS协议的加密方案：两种算法结合使用，**使用非对称加密算法加密对称加密算法的密钥**，使用对称加密算法加解密数据，既保证安全，又保证效率。

## RSA算法简介

先看看基佬给我们的解释。

> **RSA加密算法**是一种[非对称加密算法](https://zh.wikipedia.org/wiki/%E9%9D%9E%E5%AF%B9%E7%A7%B0%E5%8A%A0%E5%AF%86%E6%BC%94%E7%AE%97%E6%B3%95)。在公开密钥加密和电子商业中RSA被广泛使用。RSA是1977年由罗纳德·李维斯特（Ron Rivest）、阿迪·萨莫尔（Adi Shamir）和伦纳德·阿德曼（Leonard Adleman）一起提出的。当时他们三人都在麻省理工学院工作。RSA就是他们三人姓氏开头字母拼在一起组成的。

更多信息请查阅维基词条：[RSA加密算法](https://zh.wikipedia.org/wiki/RSA%E5%8A%A0%E5%AF%86%E6%BC%94%E7%AE%97%E6%B3%95)

## Java实现RSA加解密

该工具类基于 jdk1.8 进行封装，如果你的 jdk 低于1.8，部分代码可能需要做一定的调整（如Base64编码解码）

```java
import java.io.ByteArrayOutputStream;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import javax.crypto.Cipher;

/**
 * RSA加解密、签名、验签的工具类
 *
 * @author hxulin
 */
public final class RSAUtils {

    /**
     * 字符编码
     */
    private static final String CHARACTER_ENCODING = "utf-8";

    /**
     * 加密算法
     */
    private static final String KEY_ALGORITHM = "RSA";

    /**
     * 签名算法
     */
    private static final String SIGNATURE_ALGORITHM = "MD5withRSA";

    /**
     * RSA单次加密的最大明文长度
     */
    private static final int MAX_ENCRYPT_BLOCK = 117;

    /**
     * RSA单次解密的最大密文长度
     */
    private static final int MAX_DECRYPT_BLOCK = 128;

    private RSAUtils() {

    }

    /**
     * Base64编码
     */
    private static String encryptBASE64(byte[] data) {
        return Base64.getEncoder().encodeToString(data);
    }

    /**
     * Base64解码
     */
    private static byte[] decryptBASE64(String data) {
        return Base64.getDecoder().decode(data);
    }

    /**
     * 初始化密钥
     *
     * @return 随机生成的密钥对
     */
    public static KeyPair initKey() {
        try {
            KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance(KEY_ALGORITHM);
            keyPairGen.initialize(1024);
            return keyPairGen.generateKeyPair();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 获取公钥
     *
     * @param keyPair 密钥对对象
     * @return Base64编码的公钥
     */
    public static String getPublicKey(KeyPair keyPair) {
        return encryptBASE64(keyPair.getPublic().getEncoded());
    }

    /**
     * 获取私钥
     *
     * @param keyPair 密钥对对象
     * @return Base64编码的私钥
     */
    public static String getPrivateKey(KeyPair keyPair) {
        return encryptBASE64(keyPair.getPrivate().getEncoded());
    }

    /**
     * 使用公钥加密数据
     *
     * @param data 需要加密的原文
     * @param key  公钥
     * @return 加密后进行Base64的密文
     * @throws Exception 加密失败
     */
    public static String encryptByPublicKey(String data, String key) throws Exception {
        return encryptBASE64(encryptByPublicKey(data.getBytes(CHARACTER_ENCODING), key));
    }

    /**
     * 使用公钥加密数据
     *
     * @param data 需要加密的数据
     * @param key  公钥
     * @return 加密后的数据
     * @throws Exception 加密失败
     */
    public static byte[] encryptByPublicKey(byte[] data, String key) throws Exception {
        return cryptoByPublicKey(Cipher.ENCRYPT_MODE, data, decryptBASE64(key));
    }

    /**
     * 使用公钥解密数据
     *
     * @param data 需要解密的密文
     * @param key  公钥
     * @return 解密后的明文
     * @throws Exception 解密失败
     */
    public static String decryptByPublicKey(String data, String key) throws Exception {
        return new String(decryptByPublicKey(decryptBASE64(data), key), CHARACTER_ENCODING);
    }

    /**
     * 使用公钥解密数据
     *
     * @param data 需要解密的数据
     * @param key  公钥
     * @return 解密后的数据
     * @throws Exception 解密失败
     */
    public static byte[] decryptByPublicKey(byte[] data, String key) throws Exception {
        return cryptoByPublicKey(Cipher.DECRYPT_MODE, data, decryptBASE64(key));
    }

    /**
     * 使用公钥加解密数据
     */
    private static byte[] cryptoByPublicKey(int opmode, byte[] data, byte[] keyBytes) throws Exception {
        // 取得公钥
        X509EncodedKeySpec x509KeySpec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM);
        Key publicKey = keyFactory.generatePublic(x509KeySpec);
        // 对数据进行加解密
        Cipher cipher = Cipher.getInstance(keyFactory.getAlgorithm());
        cipher.init(opmode, publicKey);
        return handleResult(opmode, data, cipher);
    }

    /**
     * RSA加解密数据有长度限制，此处对数据做分段处理
     */
    private static byte[] handleResult(int opmode, byte[] data, Cipher cipher) throws Exception {
        int inputLen = data.length;
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int offset = 0;
        byte[] cache;
        int i = 0;
        int maxHandleLength = opmode == Cipher.ENCRYPT_MODE ? MAX_ENCRYPT_BLOCK : MAX_DECRYPT_BLOCK;
        while (inputLen > offset) {
            int length = inputLen - offset > maxHandleLength ? maxHandleLength : inputLen - offset;
            cache = cipher.doFinal(data, offset, length);
            out.write(cache, 0, cache.length);
            i++;
            offset = i * maxHandleLength;
        }
        byte[] resultData = out.toByteArray();
        out.close();
        return resultData;
    }

    /**
     * 使用私钥加密数据
     *
     * @param data 需要加密的原文
     * @param key  私钥
     * @return 加密后进行Base64的密文
     * @throws Exception 加密失败
     */
    public static String encryptByPrivateKey(String data, String key) throws Exception {
        return encryptBASE64(encryptByPrivateKey(data.getBytes(CHARACTER_ENCODING), key));
    }

    /**
     * 使用私钥加密数据
     *
     * @param data 需要加密的数据
     * @param key  私钥
     * @return 加密后的数据
     * @throws Exception 加密失败
     */
    public static byte[] encryptByPrivateKey(byte[] data, String key) throws Exception {
        return cryptoByPrivateKey(Cipher.ENCRYPT_MODE, data, decryptBASE64(key));
    }

    /**
     * 使用私钥解密数据
     *
     * @param data 需要解密的密文
     * @param key  私钥
     * @return 解密后的明文
     * @throws Exception 解密失败
     */
    public static String decryptByPrivateKey(String data, String key) throws Exception {
        return new String(decryptByPrivateKey(decryptBASE64(data), key), CHARACTER_ENCODING);
    }

    /**
     * 使用私钥解密数据
     *
     * @param data 需要解密的数据
     * @param key  私钥
     * @return 解密后的数据
     * @throws Exception 解密失败
     */
    public static byte[] decryptByPrivateKey(byte[] data, String key) throws Exception {
        return cryptoByPrivateKey(Cipher.DECRYPT_MODE, data, decryptBASE64(key));
    }

    /**
     * 使用私钥加解密数据
     */
    private static byte[] cryptoByPrivateKey(int opmode, byte[] data, byte[] keyBytes) throws Exception {
        // 取得私钥
        PKCS8EncodedKeySpec pkcs8KeySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM);
        Key privateKey = keyFactory.generatePrivate(pkcs8KeySpec);
        // 对数据进行加解密
        Cipher cipher = Cipher.getInstance(keyFactory.getAlgorithm());
        cipher.init(opmode, privateKey);
        return handleResult(opmode, data, cipher);
    }

    /**
     * 创建数字签名
     *
     * @param data       需要签名的数据
     * @param privateKey 私钥
     * @return 签名信息
     * @throws Exception 签名失败
     */
    public static String sign(String data, String privateKey) throws Exception {
        return sign(data.getBytes(CHARACTER_ENCODING), privateKey);
    }

    /**
     * 创建数字签名
     *
     * @param data       需要签名的数据
     * @param privateKey 私钥
     * @return 签名信息
     * @throws Exception 签名失败
     */
    public static String sign(byte[] data, String privateKey) throws Exception {
        // 使用Base64解码私钥
        byte[] keyBytes = decryptBASE64(privateKey);
        PKCS8EncodedKeySpec pkcs8KeySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM);
        // 获取私钥匙对象
        PrivateKey priKey = keyFactory.generatePrivate(pkcs8KeySpec);
        // 使用私钥对信息生成数字签名
        Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
        signature.initSign(priKey);
        signature.update(data);
        return encryptBASE64(signature.sign());
    }

    /**
     * 校验数字签名
     *
     * @param data      被签名的数据
     * @param publicKey 公钥
     * @param sign      数字签名
     * @return 校验成功返回true，失败返回false
     * @throws Exception 校验错误
     */
    public static boolean verify(String data, String publicKey, String sign) throws Exception {
        return verify(data.getBytes(CHARACTER_ENCODING), publicKey, sign);
    }

    /**
     * 校验数字签名
     *
     * @param data      被签名的数据
     * @param publicKey 公钥
     * @param sign      数字签名
     * @return 校验成功返回true，失败返回false
     * @throws Exception 校验错误
     */
    public static boolean verify(byte[] data, String publicKey, String sign) throws Exception {
        // 使用Base64解码公钥
        byte[] keyBytes = decryptBASE64(publicKey);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM);
        // 获取公钥匙对象
        PublicKey pubKey = keyFactory.generatePublic(keySpec);
        Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
        signature.initVerify(pubKey);
        signature.update(data);
        // 验证签名是否正常
        return signature.verify(decryptBASE64(sign));
    }

}
```

使用样例：

```java
import org.junit.Before;
import org.junit.Test;

import java.security.KeyPair;

/**
 * RSA加解密测试
 *
 * @author hxulin
 */
public class RSAUtilsTest {

	private String publicKey;
	private String privateKey;

	@Before
	public void init() {
		// 初始化RSA密钥对
		KeyPair keyPair = RSAUtils.initKey();
		// 获取公钥
		publicKey = RSAUtils.getPublicKey(keyPair);
		System.out.println("生成公钥：" + publicKey);
		// 获取私钥
		privateKey = RSAUtils.getPrivateKey(keyPair);
		System.out.println("生成私钥：" + privateKey);
	}

	@Test
	public void test() throws Exception {
		String data = "欢迎访问 https://huangxulin.cn/";
		System.out.println("待加密数据：" + data);

		String encrypt = RSAUtils.encryptByPublicKey(data, publicKey);
		System.out.println("公钥加密：" + encrypt);
		String decrypt = RSAUtils.decryptByPrivateKey(encrypt, privateKey);
		System.out.println("私钥解密：" + decrypt);

		encrypt = RSAUtils.encryptByPrivateKey(data, privateKey);
		System.out.println("私钥加密：" + encrypt);
		decrypt = RSAUtils.decryptByPublicKey(encrypt, publicKey);
		System.out.println("公钥解密：" + decrypt);

		String sign = RSAUtils.sign(data, privateKey);
		System.out.println("私钥签名：" + sign);
		boolean verify = RSAUtils.verify(data, publicKey, sign);
		System.out.println("公钥验签：" + verify);
	}

}
```

运行结果：

<img :src="$withBase('/assets/img/20181208/encryption-rsa/rsa-test.png')" alt="RSA 加解密测试" style="margin-bottom: .3rem">

RSA 加解密测试

## js实现RSA加解密

前端 js 实现RSA加解密，依赖第三方库：[jsencrypt](https://github.com/travist/jsencrypt)

```javascript
/**
 * RSA公钥加密
 *
 * @param content 待加密数据
 * @param publicKey 公钥
 * @returns {string} 加密结果
 */
function rsaEncrypt(content, publicKey) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(content);
}

/**
 * RSA私钥解密
 *
 * @param content 待解密数据
 * @param privateKey 私钥
 * @returns {string} 解密结果
 */
function rsaDecrypt(content, privateKey) {
    var encrypt = new JSEncrypt();
    encrypt.setPrivateKey(privateKey);
    return encrypt.decrypt(content);
}
```

完整项目地址：[https://github.com/hxulin/encryption](https://github.com/hxulin/encryption)

（完）