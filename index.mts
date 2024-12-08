import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { Octokit } from "@octokit/rest";

type Identity = {
  aws: string | undefined;
  github: string | undefined;
};

const aws = async (): Promise<string | undefined> => {
  try {
    const sts = new STSClient({ region: "us-east-1" });
    const response = await sts.send(new GetCallerIdentityCommand({}));
    return response.Arn;
  } catch (e) {
    return undefined;
  }
};

const github = async (): Promise<string | undefined> => {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const response = await octokit.users.getAuthenticated();
    return response.data.url;
  } catch (e) {
    return undefined;
  }
};

const identities = async (): Promise<Identity> => {
  return Promise.all([aws(), github()]).then(([aws, github]) => {
    return { aws, github };
  });
};

(async () => {
  await identities().then((identities) => {
    console.table(identities);
  });
})();
