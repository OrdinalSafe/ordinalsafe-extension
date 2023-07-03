<img src="src/assets/img/icon-128.png" width="64"/>

# OrdinalSafe Extension

OrdinalSafe is available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/ordinalsafe/coefgobimbelhfmhkpndlddjhkphgnep).

## Procedures for development:

1. Check if your [Node.js](https://nodejs.org/) version is >= **18**.
2. Copy .secrets.template.js to secrets.development.js and fill in the blanks. You will only need to fill in the `API_KEY` field. If not, you can leave it blank. The extension will still work, but it will have more strict rate limits.
3. Run `npm install` to install the dependencies.
4. Run `npm start`
5. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
6. Happy hacking.

## Packing

After the development of your extension

1. Copy .secrets.template.js to secrets.production.js and fill in the blanks. You will need to fill in the `API_KEY` field. If not, you can leave it blank. The extension will still work, but it will have more strict rate limits.
2. Run the command:

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
