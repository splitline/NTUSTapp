
package com.ntustapp;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import java.net.InetAddress;
import java.net.Socket;

import java.security.*;
import javax.net.ssl.*;
import okhttp3.*;


public class OkHttpTLSv1 implements OkHttpClientFactory {
    public OkHttpClient createNewNetworkModuleClient() {
        final ConnectionSpec spec = new ConnectionSpec.Builder(ConnectionSpec.COMPATIBLE_TLS)
            .tlsVersions(TlsVersion.TLS_1_0, TlsVersion.TLS_1_2)
            .cipherSuites(
                CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA,
                CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA,
                CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
                CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256,
                CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
                CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384,
                CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,
                CipherSuite.TLS_RSA_WITH_AES_128_GCM_SHA256,
                CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA256,
                CipherSuite.TLS_RSA_WITH_AES_256_GCM_SHA384,
                CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA256,
                CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA,

                CipherSuite.TLS_RSA_WITH_3DES_EDE_CBC_SHA   // Support `stu255.ntust.edu.tw`
            )
            .supportsTlsExtensions(true)
            .build();
        SSLContext sslContext;
        X509TrustManager trustManager;
        SSLSocketFactory sslSocketFactory;
        SSLSocketFactory customSslSocketFactory;
        try {
            trustManager = defaultTrustManager();
            sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, new TrustManager[]{trustManager}, null);
            sslSocketFactory = sslContext.getSocketFactory();
            customSslSocketFactory = new DelegatingSSLSocketFactory(sslSocketFactory) {
                @Override protected SSLSocket configureSocket(SSLSocket socket) throws IOException {
                    socket.setEnabledCipherSuites(javaNames(spec.cipherSuites()));
                    return socket;
                }
            };
        }  catch (GeneralSecurityException e) {
            throw new AssertionError(); // The system has no TLS. Just give up.
        }

        return new OkHttpClient.Builder()
            .cookieJar(new ReactCookieJarContainer())
            .connectionSpecs(Arrays.asList(spec, ConnectionSpec.CLEARTEXT))
            .sslSocketFactory(customSslSocketFactory, trustManager)
            .build();
    }

    private X509TrustManager defaultTrustManager() throws GeneralSecurityException {
        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(
            TrustManagerFactory.getDefaultAlgorithm()
        );
        trustManagerFactory.init((KeyStore) null);
        TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();
        if (trustManagers.length != 1 || !(trustManagers[0] instanceof X509TrustManager)) {
            throw new IllegalStateException("Unexpected default trust managers:"
                + Arrays.toString(trustManagers));
        }
        return (X509TrustManager) trustManagers[0];
    }

    private String[] javaNames(List<CipherSuite> cipherSuites) {
        String[] result = new String[cipherSuites.size()];
        for (int i = 0; i < result.length; i++) {
            result[i] = cipherSuites.get(i).javaName();
        }
        return result;
    }

    static class DelegatingSSLSocketFactory extends SSLSocketFactory {
        protected final SSLSocketFactory delegate;
    
        DelegatingSSLSocketFactory(SSLSocketFactory delegate) {
            this.delegate = delegate;
        }
    
        @Override public String[] getDefaultCipherSuites() {
            return delegate.getDefaultCipherSuites();
        }
    
        @Override public String[] getSupportedCipherSuites() {
            return delegate.getSupportedCipherSuites();
        }
    
        @Override public Socket createSocket(
            Socket socket, String host, int port, boolean autoClose) throws IOException {
            return configureSocket((SSLSocket) delegate.createSocket(socket, host, port, autoClose));
        }
    
        @Override public Socket createSocket(String host, int port) throws IOException {
            return configureSocket((SSLSocket) delegate.createSocket(host, port));
        }
    
        @Override public Socket createSocket(
            String host, int port, InetAddress localHost, int localPort) throws IOException {
            return configureSocket((SSLSocket) delegate.createSocket(host, port, localHost, localPort));
        }
    
        @Override public Socket createSocket(InetAddress host, int port) throws IOException {
            return configureSocket((SSLSocket) delegate.createSocket(host, port));
        }
    
        @Override public Socket createSocket(
            InetAddress address, int port, InetAddress localAddress, int localPort) throws IOException {
            return configureSocket((SSLSocket) delegate.createSocket(
                address, port, localAddress, localPort));
        }
    
        protected SSLSocket configureSocket(SSLSocket socket) throws IOException {
            return socket;
        }
    }

    
}