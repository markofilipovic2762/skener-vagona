const apiUrl = "http://10.21.57.45:8000";

export const getKompozicije = () => {
  return fetch(`${apiUrl}/kompozicije`)
    .then((response) => response.json())
    .then((json) => json.kompozicije)
    .catch((error) => console.error(error));
};

export const getVagoni = (brojUtovara: string) => {
    return fetch(`${apiUrl}/vagoni/${brojUtovara}`)
      .then((response) => response.json())
      .then((json) => json.vagoni)
      .catch((error) => console.error(error));
}

export const getProizvodi = (registracija: string) => {
    return fetch(`${apiUrl}/proizvodi/${registracija}`)
      .then((response) => response.json())
      .then((json) => json.proizvodi)
      .catch((error) => console.error(error));
}
