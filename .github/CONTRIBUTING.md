# Contribution guide

Thank you for your interest in contributing to **Nimbus-icons!** We are only going to consider icons uploaded through Github and that comply with both the process described below and the icons system guidelines.

## Adding or updating an icon

Follow these steps to add or update an icon.

### 1. Clone the repository

```shell
# Clone the repository
git clone https://github.com/cyberalien/nimbus-icons
```

```shell
# Navigate to the newly cloned directory
cd nimbus-icons
```

### 2. Create a new feature branch

```shell
git checkout -b <branch-name>
```

### 3. Add or update SVG files in the /icons directory

Before adding a new icon, check that it meets all the following requirements:

- All icons must be 16 x 16.
- Icon should be cleaned up.
- Icon sould use only default `fill` for shapes, it should not include color in SVG.

### 4. Commit and push changes

```shell
git add .
git commit -m <message>
git push
```

### 5. Create a pull request

Use GitHub to [create a pull request](https://help.github.com/en/desktop/contributing-to-projects/creating-a-pull-request) for your branch. In your pull request description, be sure to mention where the icon will be used and any relevant timeline information.

**If everything looks good**, the design team will approve and merge the pull request where appropriate. After the pull request is merged, your icon will be available in the next Nimbus-icons release.
