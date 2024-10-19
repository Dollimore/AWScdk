const createResourceId = (id: string) => (str: string) => `${id}.${str}`;

export default createResourceId;
