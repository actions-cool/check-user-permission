# 👮 Check User Permission

[![](https://img.shields.io/badge/marketplace-check--actor--permission-blueviolet?style=flat-square)](https://github.com/marketplace/actions/check-actor-permission)
[![](https://img.shields.io/github/v/release/skjnldsv/check-actor-permission?style=flat-square&color=orange)](https://github.com/skjnldsv/check-user-permission/releases)

## 🚀 How to use?

```yml
name: Check User Permission

on:
  issues:
    types: [opened, edited]
  release:
    types: [published]


jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: skjnldsv/check-actor-permission@v2
```

### Input

| Name | Desc | Type | Required |
| -- | -- | -- | -- |
| token | GitHub token | string | ✖ |
| require | Test whether the user meets the required permission | string | ✖ |

- User permission: `admin` > `write` > `read`

### Output

- `result`: When use require
- `user-permission`

> How to use? 
> - https://github.com/skjnldsv/check-actor-permission/blob/main/.github/workflows/check-permission.yml

## ⚡ Feedback

You are very welcome to try it out and put forward your comments. You can use the following methods:

- Report bugs or consult with [Issue](https://github.com/skjnldsv/check-user-permissionissues)
- Submit [Pull Request](https://github.com/skjnldsv/check-user-permission/pulls) to improve the code of `check-user-permission`

## LICENSE

[MIT](./LICENSE)
