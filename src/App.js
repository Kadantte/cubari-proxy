import React, { Component } from "react";
import { HashRouter, Switch, Route, Link } from "react-router-dom";
import Discover from "./containers/Discover.js";
import Search from "./containers/Search.js";
import History from "./containers/History.js";
// import Settings from "./containers/Settings.js";
import { classNames } from "./utils/strings";
import PageNotFound from "./containers/PageNotFound.js";
import { Disclosure, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import sourcemap from "./sources/sourcemap.js";
import InfoModal from "./components/InfoModal.js";
import ThemeSwitcher from "./components/ThemeSwitcher.js";

const navigation = {
  Discover: {
    href: "/",
    component: (app) => (
      <Discover discover={app.state.discover} setPath={app.setPath} />
    ),
  },
  Search: {
    href: "/search",
    component: (app) => <Search sources={app.sources} setPath={app.setPath} />,
  },
  History: {
    href: "/history",
    component: (app) => <History setPath={app.setPath} />
  }
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discover: new Set(),
      current: undefined,
    };
    this.sources = Object.values(sourcemap);
  }

  setPath = (path) => {
    this.setState({
      current: path,
    });
  };

  initializeDiscoverItems = () => {
    this.sources.forEach((source) => {
      source.getHomePageSections((section) => {
        if (!section.title.startsWith(source.getSourceDetails().name)) {
          section.title = `${source.getSourceDetails().name} - ${
            section.title
          }`;
        }
        section.source = source;
        section.mangaUrlizer = source.getMangaUrl;
        // Only update state with sections that have items
        if (section.items && section.items.length) {
          this.setState({
            discover: new Set(this.state.discover).add(section),
          });
        }
      });
    });
  };

  componentDidMount = () => {
    this.initializeDiscoverItems();
  };

  render() {
    return (
      <HashRouter>
        <Disclosure as="nav" className="bg-transparent">
          {({ open }) => (
            <>
              <div className="max-w-6xl mx-auto px-2 md:px-0 lg:px-0">
                <div className="relative flex items-center justify-between h-16">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="flex-1 flex sm:ml-3 items-center justify-center sm:items-stretch sm:justify-start">
                    <div className="flex-shrink-0 flex items-center">
                      {/* <img
                            className="block lg:hidden h-8 w-auto"
                            src="https://cubari.moe/static/favicon.png"
                            alt="Workflow"
                          />
                          <img
                            className="hidden lg:block h-8 w-auto"
                            src="https://cubari.moe/static/favicon.png"
                            alt="Workflow"
                          /> */}
                    </div>
                    <div className="hidden sm:block">
                      <div className="flex space-x-4">
                        {/* Desktop layout */}
                        {Object.keys(navigation).map((item) => {
                          let name = item;
                          item = navigation[name];
                          return (
                            <Link
                              key={name}
                              to={item.href}
                              onClick={() => {
                                this.setState({ current: name });
                              }}
                              className={classNames(
                                name === this.state.current
                                  ? "bg-black text-white dark:bg-gray-800 dark:text-white"
                                  : "bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                                "px-3 py-2 rounded-md text-md font-medium"
                              )}
                              aria-current={
                                name === this.state.current ? "page" : undefined
                              }
                            >
                              {name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="absolute sm:mr-3 inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <ThemeSwitcher />
                    <InfoModal />
                  </div>
                </div>
              </div>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="sm:hidden">
                  <div className="px-2 pt-2 pb-3 space-y-1">
                    {/* Mobile layout */}
                    {Object.keys(navigation).map((item) => {
                      let name = item;
                      item = navigation[name];
                      return (
                        <Link
                          key={name}
                          to={item.href}
                          onClick={() => {
                            this.setState({ current: name });
                          }}
                          className={classNames(
                            name === this.state.current
                              ? "bg-black text-white dark:bg-gray-800 dark:text-white"
                              : "bg-transparent text-black hover:bg-white dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                            "block px-3 py-2 rounded-md text-base font-medium"
                          )}
                          aria-current={
                            name === this.state.current ? "page" : undefined
                          }
                        >
                          {name}
                        </Link>
                      );
                    })}
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>

        <Switch>
          {Object.keys(navigation).map((item) => {
            let name = item;
            item = navigation[name];
            return (
              <Route exact path={item.href} key={item.href}>
                {item.component(this)}
              </Route>
            );
          })}
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </HashRouter>
    );
  }
}