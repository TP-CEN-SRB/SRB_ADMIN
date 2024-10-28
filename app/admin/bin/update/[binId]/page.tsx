import React from "react";

const page = ({ params }: { params: { binId: string } }) => {
  return <div>{params.binId}</div>;
};

export default page;
