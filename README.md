<img src="src/assets/img/icon-128.png" width="64"/>

# OrdinalSafe Extension

OrdinalSafe is available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/ordinalsafe/coefgobimbelhfmhkpndlddjhkphgnep).


## Procedures for development:

1. Check if your [Node.js](https://nodejs.org/) version is >= **18**.
2. Run `npm install` to install the dependencies.
3. Run `npm start`
4. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
5. Happy hacking.

## Packing

After the development of your extension run the command

```
$ NODE_ENV=production npm run build
```


**Note:** Inscribe feature is only available on official build.

## Resources:

- [Webpack documentation](https://webpack.js.org/concepts/)
- [Chrome Extension documentation](https://developer.chrome.com/extensions/getstarted)

## License

See [LICENSE](LICENSE).

---

**[OrdinalSafe](https://ordinalsafe.xyz) is developed by [Chainway](https://chainway.xyz) :heart:**
