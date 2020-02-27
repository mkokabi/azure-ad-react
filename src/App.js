import React, { useState } from "react";

import "./App.css";
import { UserAgentApplication } from "msal";
import { getUserDetails } from "./GraphService";
import { getCatalog } from "./CatalogService";
import config from "./Config";

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

function App() {
  const userAgentApplication = new UserAgentApplication({
    auth: {
      clientId: config.appId,
      redirectUri: config.redirectUri
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true
    }
  });

  const [loginState, setLoginState] = useState({
    isAuthenticated: false,
    user: {},
    error: null
  });

  const [treeData, setTreeData] = useState(null);

  const login = async () => {
    try {
      await userAgentApplication.loginPopup({
        scopes: config.scopes,
        prompt: "select_account"
      });
      await getUserProfile();
    } catch (err) {
      var error = {};

      if (typeof err === "string") {
        var errParts = err.split("|");
        error =
          errParts.length > 1
            ? { message: errParts[1], debug: errParts[0] }
            : { message: err };
      } else {
        error = {
          message: err.message,
          debug: JSON.stringify(err)
        };
      }

      setLoginState({
        isAuthenticated: false,
        user: {},
        error: error
      });
    }
  };

  const logout = () => {
    userAgentApplication.logout();
  };

  const getUserProfile = async () => {
    try {
      // Get the access token silently
      // If the cache contains a non-expired token, this function
      // will just return the cached token. Otherwise, it will
      // make a request to the Azure OAuth endpoint to get a token

      var accessToken = await userAgentApplication.acquireTokenSilent({
        scopes: config.scopes
      });

      if (accessToken) {
        // Get the user's profile from Graph
        var user = await getUserDetails(accessToken);
        setLoginState({
          isAuthenticated: true,
          user: {
            displayName: user.displayName,
            email: user.mail || user.userPrincipalName,
            givenName: user.givenName,
            surname: user.surname
          },
          error: null
        });
      }
    } catch (err) {
      var error = {};
      if (typeof err === "string") {
        var errParts = err.split("|");
        error =
          errParts.length > 1
            ? { message: errParts[1], debug: errParts[0] }
            : { message: err };
      } else {
        error = {
          message: err.message,
          debug: JSON.stringify(err)
        };
      }

      setLoginState({
        isAuthenticated: false,
        user: {},
        error: error
      });
    }
  };

  const loadCatalog = async () => {
    const categories = await getCatalog();
    setTreeData(categories);
  }

  const renderTree = nodes =>
    Array.isArray(nodes) ? nodes.map(node => renderTreeItem(node)) : null;

  const renderTreeItem = nodes => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map(node => renderTreeItem(node))
        : null}
    </TreeItem>
  );

  return (
    <div>
      {loginState.error ? <p>loginState.error</p> : null}
      {loginState.isAuthenticated ? (
        <div>
          <h4>Welcome {loginState.user.displayName}!</h4>
          <button color="info" onClick={loadCatalog}>
            GetCatalog
          </button>
          <button color="primary" onClick={logout}>
            Logout
          </button>
          {treeData && (
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpanded={["root"]}
              defaultExpandIcon={<ChevronRightIcon />}
            >
              {renderTree(treeData)}
            </TreeView>
          )}
        </div>
      ) : (
        <button color="primary" onClick={login}>
          Click here to sign in
        </button>
      )}
    </div>
  );
}

export default App;
