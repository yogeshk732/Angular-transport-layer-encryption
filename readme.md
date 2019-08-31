# Cryptography interceptor to encode/decode the transport layer

<ul>
<li><code>npm i crypto-ts --save</code></li>
<li><code> Specify <b>request_encode_key</b> in environment file </code></li>
<li>Include interceptor into main module provider<br>
<code>
providers: [{
      provide: HTTP_INTERCEPTORS,
      useClass: TransportEncryptionInterceptor,
      multi: true
    }]
</code>

</li>
</ul>
