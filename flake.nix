{
  description = "Dessera's blog site using vuepress";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-parts,
      ...
    }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } (
      { self, ... }:
      {
        systems = [
          "x86_64-linux"
          "aarch64-linux"
          "x86_64-darwin"
          "aarch64-darwin"
        ];

        perSystem =
          { pkgs, system, ... }:
          let
            target = pkgs.callPackage ./default.nix { };
          in
          {
            packages = {
              default = target;
            };

            devShells = {
              default = pkgs.mkShell {
                inputsFrom = [ target ];

                packages = with pkgs; [
                  nixd
                  nixfmt-rfc-style
                ];
              };
              corepack = pkgs.mkShell {
                packages = with pkgs; [
                  nixd
                  nixfmt-rfc-style

                  corepack
                ];
              };
            };
          };
      }
    );
}
