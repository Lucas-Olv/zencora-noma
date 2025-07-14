export const getCommonRegisterErrorsMessages = (error: any) => {
  const errorMessages: { [key: string]: string } = {
    "User already exists": "Já existe um usuário cadastrado com este e-mail",
  };

  return (
    errorMessages[error.message] ||
    error.message ||
    "Ocorreu um erro. Por favor, tente novamente."
  );
};

export const getCommonLoginErrorsMessages = (error: any) => {
  const errorMessages: { [key: string]: string } = {
    "User account deletion requested": "Conta marcada para exclusão",
    "E-mail not confirmed":
      "E-mail não verificado, por favor verifique seu e-mail e tente novamente",
    "User not found": "Usuário não encontrado",
    "E-mail or password is incorrect": "E-mail ou senha inválidos",
  };

  return (
    errorMessages[error.message] ||
    error.message ||
    "Ocorreu um erro. Por favor, tente novamente."
  );
};
