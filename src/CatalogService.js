export const getCatalog = async () => {
    var token = localStorage.getItem("msal.idtoken");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    try {
      const response = await fetch(
        "https://mohsenapimanagementtest.azure-api.net/Categories",
        requestOptions
      );

      const categories = await response.json();
      // setTreeData(categories);
      return categories;
    } catch (err) {
      console.log(err.message);
    }
  };