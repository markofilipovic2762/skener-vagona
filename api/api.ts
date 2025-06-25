const apiUrl = "http://10.21.57.45:8000";
// const apiUrl = "http://10.21.59.30:8000";

export const getKompozicije = () => {
  return fetch(`${apiUrl}/kompozicije`)
    .then((response) => response.json())
    .then((json) => json.kompozicije)
    .catch((error) => console.error(error));
};

export const getVagoni = () => {
  return fetch(`${apiUrl}/vagoni`)
    .then((response) => response.json())
    .then((json) => json.vagoni)
    .catch((error) => console.error(error));
};

export const getProizvodi = (registracija: string) => {
  return fetch(`${apiUrl}/proizvodi/${registracija}`)
    .then((response) => response.json())
    .then((json) => json.proizvodi)
    .catch((error) => console.error(error));
};

export const getGreske = () => {
  return fetch(`${apiUrl}/spisak_gresaka`)
    .then((response) => response.json())
    .catch((error) => console.error(error));
};

export const posaljiProizvode = async (
  skeniraniProizvodi: string[],
  kontrolor: string,
  vagon: string
) => {
  try {
    const response = await fetch(`${apiUrl}/kontrola_voz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kluc: skeniraniProizvodi, kontrolor, vagon }),
    });
    return response.json();
  } catch (error) {
    alert(error);
  }
};

export const posaljiGresku = async (
  kluc: string,
  regis: string,
  grupa: number,
  napomena: string,
  kontrolor: string
) => {
  try {
    const response = await fetch(`${apiUrl}/greska_proizvod`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kluc, regis, grupa, napomena, kontrolor }),
    });
    return response.json();
  } catch (error) {
    alert(error);
  }
};
