{
  lib,
  callPackage,
  nodejs_23,
}:

let

  project =
    callPackage ./yarn-project.nix
      {
        nodejs = nodejs_23;
      }
      {
        src = lib.cleanSource ./.;
      };

in
project.overrideAttrs (oldAttrs: {
  buildPhase = ''
    runHook preBuild
    yarn docs:build
    runHook postBuild
  '';
})
