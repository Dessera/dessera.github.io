{
  description = "Dessera's blog site using vuepress";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixcode.url = "github:Dessera/nixcode";
  };

  nixConfig = {
    extra-substituters = [
      "https://nixcode.cachix.org"
    ];

    extra-trusted-public-keys = [
      "nixcode.cachix.org-1:6FvhF+vlN7gCzQ10JIKVldbG59VfYVzxhH/+KGHvMhw="
    ];
  };

  outputs =
    { flake-parts, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } (
      { withSystem, ... }:
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
            code = withSystem system ({ inputs', ... }: inputs'.nixcode.packages.nixcode-web);
          in
          {
            packages.default = target;

            devShells.default = pkgs.mkShell {
              inputsFrom = [ target ];

              packages =
                (with pkgs; [
                  nixd
                  nixfmt-rfc-style
                ])
                ++ [ code ];
            };
          };
      }
    );
}
