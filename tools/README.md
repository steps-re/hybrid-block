# Rebuild without the password

`index.html` is StatiCrypt-encrypted. You do not need the password to rebuild it,
only the `hashedPassword` (the `#staticrypt_pwd=` fragment in the calendar links,
stored in Secret Manager `hybrid-block-autodecrypt-url`).

    export HP=<hashedPassword hex>
    node tools/rebuild.js decrypt index.html /tmp/live.html      # prove the key: diff vs index.built.html
    python3 - <<'PY'
    import os; s=open('index.src.html').read().replace('__HB_DATA_KEY__', os.environ['DK']); open('index.built.html','w').write(s)
    PY
    node tools/rebuild.js encrypt index.html index.built.html index.html   # splices a new payload into the shell
    git add index.html && git commit && git push

`DK` = Secret Manager `hybrid-block-data-key`. Never commit `index.src.html`, `index.built.html`,
or anything containing DK or HP.
