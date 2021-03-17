import * as axios from 'axios';
// import { google } from 'googleapis';
import cases from 'jest-in-case';

cases(
  `getGoogleProfileFromToken() - Code is valid.`,
  () => {
    const mockedAxios = jest.spyOn(axios, 'default').mockResolvedValue({
      data: { id_token: 'abc' }
    } as axios.AxiosResponse);

    expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
  },
  {}
);

// cases(
//   `getGoogleProfileFromToken() - Code is not valid.`,
//   () => {},
//   {}
// )
