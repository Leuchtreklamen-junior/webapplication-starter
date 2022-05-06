# Trainstation(english)

In this project for the WebApplications course at the University of Regensburg we decided to implement a digital business card in the form of a 3D world. The goal of this page is to provide the user with several pieces of information about us and at the same time demonstrate our skills through experience. The page can then be used as an attachment for job applications or similar.
Once on the site, the user has no real task but to simply stay in the 3D world, look at everything at their leisure and learn various details.

The website is built in such a way that we can both modify and customize it very easily afterwards to use it in our further careers. 

As an idea, we started by creating our avatars. The site [Ready Player Me](https://readyplayer.me) provides a configurator where you can build your own avatar. This is then saved as an .fbx file and can be opened in [Blender](https://www.blender.org). Here you have to save all textures of the avatar in a separate textures folder to apply them again after the animation. For animation the avatar is then uploaded to [Mixamo](https://www.mixamo.com). Here you can choose different movements, which will be saved directly to the avatar. We have chosen here an idle (standing movement), a running movement, a racing movement, a dance movement and two extra movements. The individual animations can then be put back together in Blender and saved as a .glb file.

Also the individual objects like station or trains were exported via Blender as a .glb file.
Objects:
- Station (self made) [Blender](https://www.blender.org)
- Train [Sketchfab](https://sketchfab.com)
- Rails [Sketchfab](https://sketchfab.com)
- Information board [Sketchfab](https://sketchfab.com)
- Advertising board [Sketchfab](https://sketchfab.com) + display customized
- Advertising display [Sketchfab](https://sketchfab.com)
- Lamps [Sketchfab](https://sketchfab.com)
- Breakaway [Sketchfab](https://sketchfab.com)
- Textures [Blenderkit](https://blenderkit.com)

To display the 3D world in the browser we decided to use the Three.js library [Three.js](https://threejs.org). It has several loaders with which you can create objects, images, sounds, music, lights or shadows in a 3D world. It is based on WebGL, which is a JavaScript API for rendering interactive 2D and 3D graphics in any compatible web.

All displays were realized in Photoshop and then placed as images in front of the respective objects afterwards.
Images:
- Three.js Advertising [Three.js Logo](https://discourse.threejs.org/t/three-js-svg-logo/21835)
- Social Media [Social Media Logo](https://de.freepik.com/vektoren-kostenlos/social-media-logo-sammlung_10363321.htm#query=social%20media%20icons&position=15&from_view=keyword)
- Fahrplan [ICE Train](https://www.test.de/file/image/15/15/a8ff082c-7f6a-4879-b6ce-134c58856db5-web/5730272_t202104062sb04_Bahn_600;a3-2.png)

## Problems 

1. due to the amount and size of media (images, audio, objects), the website requires a relatively large amount of RAM and sufficient graphics support. Although the website is built in such a way that it could theoretically be used on a cell phone, no cell phone can display the website smoothly.
We assume that the minimum requirements are currently a Gforce GTX 1050Ti and 16 GB of RAM. In the future, we could still take care of compressing the objects or hosting the website through servers. 
2. the amount of data also leads to long loading times when the internet connection is poor. 
3. the browser has a problem with playing the audio tracks when the page is first loaded. Often it is enough to press any key, but more often only reloading the page helps.

## Hosting

The website is currently hosted by [GitHub.io](https://leuchtreklamen-junior.github.io/webapplication-starter/). (06.05.2022)


# Trainstation(deutsch)

In diesem Projekt für den Kurs WebApplications der Universität Regensburg haben wir uns dafür entschieden eine Digitale Visitenkarte in Form einer 3D Welt zu implementieren. Ziel dieser Seite ist es dem Nutzer mehrere Informationen über uns zu vermitteln und gleichzeitig durch die Erfahrung unsere Fähigkeiten zu demonstrieren. Die Seite kann dann zum Beispiel bei Bewerbungen oder ähnlichen als Anhang verwendet werden.
Einmal auf der Website angekommen hat der Nutzer keine richtige Aufgabe sondern soll sich einfach in der 3D Welt aufhalten, sich alles in Ruhe anschauen und verschiedene Details erfahren.

Die Website ist so aufgebaut, dass wir sie beide im nachhinein sehr leicht modifizieren und individuell anpassen können, um sie auch in unserer weiteren Karriere zu nutzen. 

Als Idee haben wir damit angefangen unsere Avatare zu erstellen. Die Seite [Ready Player Me](https://readyplayer.me) stellt einen Konfigurator zur Verfügung, in dem man sich seinen eigenen Avatar zusammenbauen kann. Dieser wird dann als .fbx Datei abgespeichert und kann in [Blender](https://www.blender.org) geöffnet werden. Hier muss man alle Texturen des Avatars in einem separaten Textures Ordner abspeichern um diese dann nach der Animation wieder anzuwenden. Zur Animation wird dann der Avatar in [Mixamo](https://www.mixamo.com) hochgeladen. Hier kann man sich verschiedene Bewegungen heraussuchen, welche dann direkt auf den Avatar abgespeichert werden. Wir haben uns hier für ein Idle (Stehbewegung), eine Laufbewegung, eine Rennbewegung, eine Tanzbewegung und zwei extra Bewegungen entschieden. Die einzelnen Animationen können dann wieder in Blender zusammengefügt und als .glb Datei abgespeichert werden.

Auch die einzelnen Objekte wie Bahnhof oder Züge wurden über Blender als .glb Datei Exportiert.
Objekte:
- Bahnhof (selbst erstellt) [Blender](https://www.blender.org)
- Zug [Sketchfab](https://sketchfab.com)
- Schienen [Sketchfab](https://sketchfab.com)
- Informationstafel [Sketchfab](https://sketchfab.com)
- Werbetafel [Sketchfab](https://sketchfab.com) + Anzeige angepasst
- Werbeanzeige [Sketchfab](https://sketchfab.com)
- Lampen [Sketchfab](https://sketchfab.com)
- Absprerrung [Sketchfab](https://sketchfab.com)
- Texturen [Blenderkit](https://blenderkit.com)

Um die 3D Welt im Browser anzuzeigen haben wir uns für die Three.js Library entschieden [Three.js](https://threejs.org). Sie verfügt über verschiedene Loader mit denen man in einer 3D Welt zum Beispiel Objekte, Bilder, Geräusche, Musik, Lichter oder Schatten erschaffen kann. Sie basiert auf WebGL, welches eine JavaScript-API zum Rendern interaktiver 2D- und 3D-Grafiken in jedem kompatiblen Web ist.

Alle Anzeigen wurden in Photoshop realisiert und dann im nachhinein als Bilder vor die jeweiligen Objekte plaziert.
Bilder:
- Three.js Werbung [Three.js Logo](https://discourse.threejs.org/t/three-js-svg-logo/21835)
- Social Media [Social Media Logo](https://de.freepik.com/vektoren-kostenlos/social-media-logo-sammlung_10363321.htm#query=social%20media%20icons&position=15&from_view=keyword)
- Fahrplan [ICE Train](https://www.test.de/file/image/15/15/a8ff082c-7f6a-4879-b6ce-134c58856db5-web/5730272_t202104062sb04_Bahn_600;a3-2.png)

## Probleme 

1. Aufgrund der Menge und Größe der Medien (Bilder, Audio, Objekte) benötigt die Website einen relativ großen Arbeitsspeicher und ausreichende Grafikunterstützung. Obwohl die Website so aufgebaut ist, dass sie theoretisch auch auf einem Handy genutzt werden könnte, kann kein Handy die Website flüssig darstellen.
Wir gehen davon aus, dass die Mindestanforderungen derzeit eine Gforce GTX 1050Ti und 8 GB RAM sind. In Zukunft könnten wir uns noch um die Komprimierung der Objekte oder das Hosting der Website über Server kümmern. 
2.  Die Datenmenge führt auch zu langen Ladezeiten, wenn die Internetverbindung schlecht ist. 
3.  Der Browser hat ein Problem mit dem Abspielen der Audiospuren beim ersten Laden der Seite. Oft reicht es, eine beliebige Taste zu drücken, aber häufiger hilft nur das Neuladen der Seite.


## Hosting

Die Webseite wird aktuell von [GitHub.io](https://leuchtreklamen-junior.github.io/webapplication-starter/) gehosted. (06.05.2022)





