import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 5000,
  duration: "1m",
};

export default function () {
  http.get("http://documentalb-834793646.ap-south-1.elb.amazonaws.com/api/health");
  sleep(1);
}