## Setup AWS Keys

Create a new IAM user on AWS. It doesn't need console access. For now, give this user admin access, but for production this should be limited down to only the services you're deploying in these scripts.

Copy the AWS Access Key and AWS Secret Key and add them to your aws credentials. You can do this by editing the `~/.aws/credentials` file by running `code ~/.aws/credentials` if you've installed the code command line tool. This will look something like;

```
[default]
aws_access_key_id=YOUR_ACCESS_KEY_HERE
aws_secret_access_key=YOUR_SECRET_KEY_HERE
```

The `[default]` will be used when no `--profile` is used with the cdk command. Not using the `--profile` simulates how the CI Pipeline would call the scripts, so you don't need specific dev scripts in the `package.json` file. But the `[default]` is the name of the profile, so you can have others in here under something like `[other]` and `[project]`.

## Setup the project

1. Install Node Version Manager (NVM) if you haven't already.
2. Run `nvm use` through a terminal/command line in the current project root. This will use the specified node version in the `.nvmrc`.
3. Run `yarn install` inside the root project dir.
4. Create a `.env` file in the root and add any secret keys.
5. Run `yarn bootstrap` to check the scripts and prepare the AWS CDK stacks.

## Changing the scripts

The stacks which will be deployed are initialized in the `bin/cdk.ts` file.

## Deploy the infrastructure

When you're ready, run `yarn deploy` or `yarn deploy:your-script` to deploy the stack/s.

