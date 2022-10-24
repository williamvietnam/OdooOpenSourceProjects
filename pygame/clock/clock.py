import pygame

pygame.init()

screen = pygame.display.set_mode((500, 600))

while True:
    screen.fill((150, 150, 150))

    for event in pygame.event.get():
        pass

    pygame.display.flip()

pygame.quit()

