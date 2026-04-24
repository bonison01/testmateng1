export async function getCandidateById(id: string) {
  const res = await fetch(`https://api.justmateng.info/candidates/${id}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw {
        status: 404,
        message: "No candidate found with this Registration Number",
      };
    }

    throw {
      status: res.status,
      message: "Failed to fetch candidate",
    };
  }

  return res.json();
}

export async function getCandidateBySearch(dob: string, phone: string) {
  const res = await fetch(
    `https://api.justmateng.info/candidates/search?dob=${dob}&phone=${phone}`
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw {
        status: 404,
        message: "No candidate found with provided details",
      };
    }

    throw {
      status: res.status,
      message: "Search failed",
    };
  }

  return res.json();
}