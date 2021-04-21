export type ServerAuthentication = {
  username: string;
  password: string;
};

export type ServerOptions = {
  auth?: ServerAuthentication;
};
