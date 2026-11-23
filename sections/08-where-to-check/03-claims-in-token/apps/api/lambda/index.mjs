// Pre Token Generation（V2）の Lambda。Cognito がトークンを作る前に呼ぶ。
// API にユーザーの所属を聞き、アクセストークンの teams クレームに載せる。
export const handler = async (event) => {
  const sub = event.request.userAttributes.sub;
  // compose のネットワークの中なので、API にはサービス名（api）で届く
  const response = await fetch(`http://api:3000/teams?userId=${sub}`);
  const teams = await response.json();
  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: { claimsToAddOrOverride: { teams } },
    },
  };
  return event;
};
