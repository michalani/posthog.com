---
title: Frontend coding conventions
sidebar: Handbook
---

In this page you can find a collection of guidelines, style suggestions, and tips for making contributions to the codebase.


#### Two layers: Kea -> React

Our frontend webapp is written with [Kea](https://keajs.org/) and [React](https://reactjs.org/) as two separate layers. Kea is used to organise the app's data for rendering (we call this the *data* or *state* layer), and React is used to render the computed state (this is the *view* or *template* layer).

We try to be very explicit about this separation, and avoid local React state wherever possible, with exceptions for the `lib/` folder. Having all our data in one layer makes for code that's easier to [test](https://kea.js.org/docs/guide/testing), and observe. Basically, getting your [data layer](https://kea.js.org/blog/data-first-frontend-revolution) right is hard enough. We aim to not make it harder by constraining your data to a DOM-style hierarchy.

Hence the explicitly in keeping the layers separate.

#### General tips

- Think data first: get [your mental model of the data flowing through the app](https://acco.io/i-escaped-node) right, and then everything else will be simpler.
- Be practical, yet remember that you are balancing speed of delivery with ease of maintainability. If you have to choose: code should be easier to understand than it was to write.

#### Do-s & Don't-s

- General
  - Write all new code with TypeScript and proper typing.
  - Write your frontend data handling code first, and write it in a Kea `logic`.
  - Don't use `useState` or `useEffect` to store local state. It's false convenience. Take the extra 3 minutes and change it to a `logic` early on in the development.
  - Logics still have a tiny initialization cost. Hence this rule doesn't apply to library components in the `lib/` folder, which might be rendered hundreds of times on a page with different sets of data. Still feel free to write a logic for a complicated `lib/` component when needed.
  - Use named exports (`export const DashboardMenu = () => <div />`), and avoid `default` exports.
- Naming things:
  - Always look around the codebase for naming conventions, and follow the best practices of the environment (e.g. use `camelCase` variables in JS, `snake_case` in Python).
  - Use clear, yet functional names (`searchResults` vs `data`).
  - Logics are camelCase (`dashboardLogic`)
  - React components are PascalCase (`DashboardMenu`).
  - Props for both logics and components are PascalCase and end with `Props` (`DashboardLogicProps` & `DashboardMenuProps`)
  - Name the `.ts` file according to its main export: `DashboardMenu.ts` or `DashboardMenu.tsx` or `dashboardLogic.ts` or `Dashboard.scss`. Pay attention to the case.
  - Avoid `index.ts`, `styles.css`, and other generic names, even if this is the only file in a directory.
- CSS
  - We use regular SCSS files for styling to keep things simple and maintainable in the long run, as opposed to supporting the CSS-in-JS flavour of the month.
  - Inside `MyBlogComponent.tsx` import `MyBlogComponent.scss`
  - Namespace all your CSS rules under globally unique classes that match the component's name and case, for example `.DashboardMenu { put everything here }`
  - We loosely follow BEM conventions. If an element can't be namespaced inside a container class (e.g. modals that break out of the containing DOM element), use BEM style names like `.DashboardMenu__modal` to keep things namespaced.
- Testing
  - Write [logic tests](https://kea.js.org/docs/guide/testing) for all logic files. 
  - If your component is in the `lib/` folder, and has some interactivity, write a [react testing library](https://testing-library.com/docs/react-testing-library/intro/) test for it.
  - Add all new presentational elements and scenes to [our storybook](https://storybook.posthog.net/). Run `yarn storybook` locally.
