import { css } from 'styled-components';
interface LanguageGithubColorProps {
  isColor?: boolean | undefined;
}
export const LanguageGithubColor = css`
  .null {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? 'transparent' : '')};
    background-color: ${(props: LanguageGithubColorProps) =>
      props.isColor === undefined || false ? 'transparent' : ''};
  }
  .language {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? 'transparent' : '')};
    background-color: ${(props: LanguageGithubColorProps) =>
      props.isColor === undefined || false ? 'transparent' : ''};
  }
  .No-Language {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0e60e3' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0e60e3' : '')};
  }
  .ABAP {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#e8274b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#e8274b' : '')};
  }
  .ActionScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#882b0f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#882b0f' : '')};
  }
  .Ada {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#02f88c' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#02f88c' : '')};
  }
  .Agda {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#315665' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#315665' : '')};
  }
  .AGS-Script {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b9d9ff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b9d9ff' : '')};
  }
  .Alloy {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#64c800' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#64c800' : '')};
  }
  .AMPL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#e6efbb' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#e6efbb' : '')};
  }
  .ANTLR {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#9dc3ff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#9dc3ff' : '')};
  }
  .API-Blueprint {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#2acca8' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#2acca8' : '')};
  }
  .Jupyter-Notebook {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#da5b0b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#da5b0b' : '')};
  }
  .APL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#5a8164' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#5a8164' : '')};
  }
  .Arc {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#aa2afe' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#aa2afe' : '')};
  }
  .Arduino {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#bd79d1' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#bd79d1' : '')};
  }
  .ASP {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#6a40fd' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#6a40fd' : '')};
  }
  .AspectJ {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#a957b0' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#a957b0' : '')};
  }
  .Assembly {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#6e4c13' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#6e4c13' : '')};
  }
  .ATS {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#1ac620' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#1ac620' : '')};
  }
  .AutoHotkey {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#6594b9' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#6594b9' : '')};
  }
  .AutoIt {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#1c3552' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#1c3552' : '')};
  }
  .BlitzMax {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#cd6400' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#cd6400' : '')};
  }
  .Boo {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#d4bec1' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#d4bec1' : '')};
  }
  .Brainfuck {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#2f2530' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#2f2530' : '')};
  }
  .C {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#555555' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#555555' : '')};
  }
  .Chapel {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#8dc63f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#8dc63f' : '')};
  }
  .Cirru {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ccccff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ccccff' : '')};
  }
  .Clarion {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#db901e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#db901e' : '')};
  }
  .Clean {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3f85af' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3f85af' : '')};
  }
  .Click {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#e4e6f3' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#e4e6f3' : '')};
  }
  .Clojure {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#db5855' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#db5855' : '')};
  }
  .CoffeeScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#244776' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#244776' : '')};
  }
  .ColdFusion-CFC {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ed2cd6' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ed2cd6' : '')};
  }
  .ColdFusion {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ed2cd6' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ed2cd6' : '')};
  }
  .Common-Lisp {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3fb68b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3fb68b' : '')};
  }
  .Component-Pascal {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b0ce4e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b0ce4e' : '')};
  }
  .C- {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#f34b7d' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#f34b7d' : '')};
  }
  .Crystal {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#776791' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#776791' : '')};
  }
  .CSS {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#563d7c' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#563d7c' : '')};
  }
  .D {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ba595e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ba595e' : '')};
  }
  .Dart {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#00b4ab' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#00b4ab' : '')};
  }
  .Diff {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#88dddd' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#88dddd' : '')};
  }
  .PowerShell {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#178600' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#178600' : '')};
  }
  .DM {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#447265' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#447265' : '')};
  }
  .Dogescript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#cca760' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#cca760' : '')};
  }
  .Dylan {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#6c616e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#6c616e' : '')};
  }
  .E {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ccce35' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ccce35' : '')};
  }
  .Eagle {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#814c05' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#814c05' : '')};
  }
  .eC {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#913960' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#913960' : '')};
  }
  .ECL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#8a1267' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#8a1267' : '')};
  }
  .edn {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#db5855' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#db5855' : '')};
  }
  .Eiffel {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#946d57' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#946d57' : '')};
  }
  .Elixir {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#6e4a7e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#6e4a7e' : '')};
  }
  .Elm {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#60b5cc' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#60b5cc' : '')};
  }
  .Emacs-Lisp {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#c065db' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#c065db' : '')};
  }
  .EmberScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#fff4f3' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#fff4f3' : '')};
  }
  .Erlang {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b83998' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b83998' : '')};
  }
  .F-- {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b845fc' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b845fc' : '')};
  }
  .Factor {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#636746' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#636746' : '')};
  }
  .Fancy {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#7b9db4' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#7b9db4' : '')};
  }
  .Fantom {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dbded5' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dbded5' : '')};
  }
  .FLUX {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#88ccff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#88ccff' : '')};
  }
  .Forth {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#341708' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#341708' : '')};
  }
  .FORTRAN {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#4d41b1' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#4d41b1' : '')};
  }
  .FreeMarker {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0050b2' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0050b2' : '')};
  }
  .Frege {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#00cafe' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#00cafe' : '')};
  }
  .Game-Maker-Language {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#8fb200' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#8fb200' : '')};
  }
  .Glyph {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#e4cc98' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#e4cc98' : '')};
  }
  .Gnuplot {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#f0a9f0' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#f0a9f0' : '')};
  }
  .Go {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#375eab' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#375eab' : '')};
  }
  .Golo {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#88562a' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#88562a' : '')};
  }
  .Gosu {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#82937f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#82937f' : '')};
  }
  .Grammatical-Framework {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#79aa7a' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#79aa7a' : '')};
  }
  .Groovy {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#e69f56' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#e69f56' : '')};
  }
  .Handlebars {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#01a9d6' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#01a9d6' : '')};
  }
  .Harbour {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0e60e3' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0e60e3' : '')};
  }
  .Haskell {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#29b544' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#29b544' : '')};
  }
  .Haxe {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#df7900' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#df7900' : '')};
  }
  .HTML {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#e44b23' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#e44b23' : '')};
  }
  .Hy {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#7790b2' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#7790b2' : '')};
  }
  .IDL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#a3522f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#a3522f' : '')};
  }
  .Io {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#a9188d' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#a9188d' : '')};
  }
  .Ioke {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#078193' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#078193' : '')};
  }
  .Isabelle {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#fefe00' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#fefe00' : '')};
  }
  .J {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#9eedff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#9eedff' : '')};
  }
  .Java {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b07219' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b07219' : '')};
  }
  .JavaScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#f1e05a' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#f1e05a' : '')};
  }
  .JFlex {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dbca00' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dbca00' : '')};
  }
  .JSONiq {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#40d47e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#40d47e' : '')};
  }
  .Julia {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#a270ba' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#a270ba' : '')};
  }
  .Jupyter-Notebook {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#da5b0b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#da5b0b' : '')};
  }
  .Kotlin {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#f18e33' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#f18e33' : '')};
  }
  .KRL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#28431f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#28431f' : '')};
  }
  .Lasso {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#999999' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#999999' : '')};
  }
  .Latte {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#a8ff97' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#a8ff97' : '')};
  }
  .Lex {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dbca00' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dbca00' : '')};
  }
  .LFE {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#004200' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#004200' : '')};
  }
  .LiveScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#499886' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#499886' : '')};
  }
  .LOLCODE {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#cc9900' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#cc9900' : '')};
  }
  .LookML {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#652b81' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#652b81' : '')};
  }
  .LSL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3d9970' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3d9970' : '')};
  }
  .Lua {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#000080' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#000080' : '')};
  }
  .Makefile {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#427819' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#427819' : '')};
  }
  .Mask {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#f97732' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#f97732' : '')};
  }
  .Matlab {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#bb92ac' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#bb92ac' : '')};
  }
  .Max {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#c4a79c' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#c4a79c' : '')};
  }
  .MAXScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#00a6a6' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#00a6a6' : '')};
  }
  .Mercury {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ff2b2b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ff2b2b' : '')};
  }
  .Metal {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#8f14e9' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#8f14e9' : '')};
  }
  .Mirah {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#c7a938' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#c7a938' : '')};
  }
  .MTML {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b7e1f4' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b7e1f4' : '')};
  }
  .NCL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#28431f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#28431f' : '')};
  }
  .Nemerle {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3d3c6e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3d3c6e' : '')};
  }
  .nesC {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#94b0c7' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#94b0c7' : '')};
  }
  .NetLinx {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0aa0ff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0aa0ff' : '')};
  }
  .NetLinx-ERB {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#747faa' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#747faa' : '')};
  }
  .NetLogo {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ff6375' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ff6375' : '')};
  }
  .NewLisp {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#87aed7' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#87aed7' : '')};
  }
  .Nimrod {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#37775b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#37775b' : '')};
  }
  .Nit {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#009917' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#009917' : '')};
  }
  .Nix {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#7e7eff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#7e7eff' : '')};
  }
  .Nu {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#c9df40' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#c9df40' : '')};
  }
  .Objective-C {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#438eff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#438eff' : '')};
  }
  .Objective-C- {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#6866fb' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#6866fb' : '')};
  }
  .Objective-J {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ff0c5a' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ff0c5a' : '')};
  }
  .OCaml {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3be133' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3be133' : '')};
  }
  .Omgrofl {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#cabbff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#cabbff' : '')};
  }
  .ooc {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b0b77e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b0b77e' : '')};
  }
  .Opal {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#f7ede0' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#f7ede0' : '')};
  }
  .Oxygene {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#cdd0e3' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#cdd0e3' : '')};
  }
  .Oz {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#fab738' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#fab738' : '')};
  }
  .Pan {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#cc0000' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#cc0000' : '')};
  }
  .Papyrus {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#6600cc' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#6600cc' : '')};
  }
  .Parrot {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#f3ca0a' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#f3ca0a' : '')};
  }
  .Pascal {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b0ce4e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b0ce4e' : '')};
  }
  .PAWN {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dbb284' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dbb284' : '')};
  }
  .Perl {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0298c3' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0298c3' : '')};
  }
  .Perl6 {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0000fb' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0000fb' : '')};
  }
  .PHP {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#4f5d95' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#4f5d95' : '')};
  }
  .PigLatin {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#fcd7de' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#fcd7de' : '')};
  }
  .Pike {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#005390' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#005390' : '')};
  }
  .PLSQL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dad8d8' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dad8d8' : '')};
  }
  .PogoScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#d80074' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#d80074' : '')};
  }
  .Processing {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0096d8' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0096d8' : '')};
  }
  .Prolog {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#74283c' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#74283c' : '')};
  }
  .Propeller-Spin {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#7fa2a7' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#7fa2a7' : '')};
  }
  .Puppet {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#302b6d' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#302b6d' : '')};
  }
  .Pure Data {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#91de79' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#91de79' : '')};
  }
  .PureBasic {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#5a6986' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#5a6986' : '')};
  }
  .PureScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#1d222d' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#1d222d' : '')};
  }
  .Python {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3572a5' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3572a5' : '')};
  }
  .QML {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#44a51c' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#44a51c' : '')};
  }
  .R {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#198ce7' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#198ce7' : '')};
  }
  .Racket {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#22228f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#22228f' : '')};
  }
  .Ragel-in-Ruby-Host {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#9d5200' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#9d5200' : '')};
  }
  .RAML {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#77d9fb' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#77d9fb' : '')};
  }
  .Rebol {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#358a5b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#358a5b' : '')};
  }
  .Red {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ee0000' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ee0000' : '')};
  }
  .Ren-Py {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ff7f7f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ff7f7f' : '')};
  }
  .Rouge {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#cc0088' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#cc0088' : '')};
  }
  .Ruby {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#701516' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#701516' : '')};
  }
  .Rust {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dea584' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dea584' : '')};
  }
  .SaltStack {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#646464' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#646464' : '')};
  }
  .SAS {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b34936' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b34936' : '')};
  }
  .Scala {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dc322f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dc322f' : '')};
  }
  .Scheme {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#1e4aec' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#1e4aec' : '')};
  }
  .Self {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#0579aa' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#0579aa' : '')};
  }
  .Shell {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#89e051' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#89e051' : '')};
  }
  .Shen {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#120f14' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#120f14' : '')};
  }
  .Slash {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#007eff' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#007eff' : '')};
  }
  .Slim {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ff8f77' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ff8f77' : '')};
  }
  .Smalltalk {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#596706' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#596706' : '')};
  }
  .SourcePawn {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#5c7611' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#5c7611' : '')};
  }
  .SQF {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3f3f3f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3f3f3f' : '')};
  }
  .Squirrel {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#800000' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#800000' : '')};
  }
  .Stan {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b2011d' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b2011d' : '')};
  }
  .Standard-ML {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dc566d' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dc566d' : '')};
  }
  .SuperCollider {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#46390b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#46390b' : '')};
  }
  .Swift {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ffac45' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ffac45' : '')};
  }
  .SystemVerilog {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#dae1c2' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#dae1c2' : '')};
  }
  .Tcl {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#e4cc98' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#e4cc98' : '')};
  }
  .TeX {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#3d6117' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#3d6117' : '')};
  }
  .Turing {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#45f715' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#45f715' : '')};
  }
  .TypeScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#2b7489' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#2b7489' : '')};
  }
  .Unified-Parallel-C {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#4e3617' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#4e3617' : '')};
  }
  .Unity3D-Asset {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#ab69a1' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#ab69a1' : '')};
  }
  .UnrealScript {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#a54c4d' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#a54c4d' : '')};
  }
  .Vala {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#fbe5cd' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#fbe5cd' : '')};
  }
  .Verilog {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#b2b7f8' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#b2b7f8' : '')};
  }
  .VHDL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#adb2cb' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#adb2cb' : '')};
  }
  .VimL {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#199f4b' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#199f4b' : '')};
  }
  .Visual-Basic {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#945db7' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#945db7' : '')};
  }
  .Volt {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#1f1f1f' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#1f1f1f' : '')};
  }
  .Vue {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#2c3e50' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#2c3e50' : '')};
  }
  .Web-Ontology-Language {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#9cc9dd' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#9cc9dd' : '')};
  }
  .wisp {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#7582d1' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#7582d1' : '')};
  }
  .X10 {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#4b6bef' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#4b6bef' : '')};
  }
  .xBase {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#403a40' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#403a40' : '')};
  }
  .XC {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#99da07' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#99da07' : '')};
  }
  .XQuery {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#5232e7' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#5232e7' : '')};
  }
  .Zephir {
    color: ${(props: LanguageGithubColorProps) => (props.isColor !== undefined || true ? '#118f9e' : '')};
    background-color: ${(props: LanguageGithubColorProps) => (props.isColor === undefined || false ? '#118f9e' : '')};
  }
`;
