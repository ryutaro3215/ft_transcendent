export type RegisterFormValue = {
  name: string;
  email: string;
  password: string;
};

export type RegisterFormProps = {
  onSubmit?: (values: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
};

export type LoginFormValue = {
  email: string;
  password: string;
};

export type LoginFormPorps = {
  onSubmit?: (values: {
    email: string;
    password: string;
  }) => Promise<void> | void;
};
