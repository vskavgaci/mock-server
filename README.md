# Mock Api Server

[MockApi Client](https://github.com/vskavgaci/mock-client) için backend servisidir.

## Kurulum

#### Gereksinimler
MongoDB

.env dosyası oluşturarak bu alanda;

```
JWT_SECRET=mockapi.me
MONGO_SERVER=mongodb://localhost/myapp
```

değişkenlerini oluşturun.

#### Kurulum


```bash
npm install
node ./bin/www
```


## Contributing
Herhangi sorunla karşılaşırsanız bu konu ile ilgili issue açabilir, ya da pull request talebinde bulunabilirsiniz.

## License
[MIT](https://choosealicense.com/licenses/mit/)
