import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.default.svc.cluster.local',
      headers: req.headers
    });
  } else {
    return axios.create({
      baseURL: '/'
    });
  }
};

export default buildClient;
